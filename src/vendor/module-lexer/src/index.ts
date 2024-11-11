#!/usr/bin/env tsx
// rm -rf ~/.config/yarn/link/*
// https://github.com/alangpierce/sucrase/commit/61c05e1e6f29c906c432da57c91ab44660196c8d
import {
  ContextualKeyword,
  type TokenType,
  parse,
  TokenType as tt,
} from "./vendor/sucrase";

// declare const abc: import('@babel/core').types.ImportDeclaration;
// abc.specifiers

interface Node {
  readonly start: number;
  readonly end: number;
}

interface Identifier extends Node {
  readonly name: string;
}
interface StringLiteral extends Node {
  readonly value: string;
}

const enum ImportSpecifierKind {
  Namespace = "Symbol(Namespace)",
  Default = "Symbol(Default)",
  Named = "Symbol(Named)",
}

interface ImportDeclarationBase {
  readonly source: StringLiteral;
  readonly importKind: ImportKind;
}

interface ImportNamespaceSpecifier {
  readonly type: ImportSpecifierKind.Namespace;
  readonly local?: Identifier;
}
interface ImportDefaultSpecifier {
  readonly type: ImportSpecifierKind.Default;
  readonly local?: Identifier;
}
interface ImportSpecifier {
  readonly type: ImportSpecifierKind.Named;
  readonly imported: Identifier | StringLiteral;
  readonly local?: Identifier;
}

const enum ImportKind {
  Value = "value",
  Type = "type",
}

type ImportDeclarationSpecifier =
  | ImportSpecifier
  | ImportDefaultSpecifier
  | ImportNamespaceSpecifier;

// interface ExportDeclaration extends Node {
//   type: string;
//   exportedNames: string[];
//   source?: string;
//   alias?: string;
// }

class NamedImport {
  constructor(
    readonly importKind: ImportKind,
    readonly importedName: Identifier | StringLiteral,
    readonly localName: Identifier,
  ) {}
}

class ImportInfo {
  defaultNames: Identifier[] = [];
  wildcardNames: Identifier[] = [];
  namedImports: NamedImport[] = [];
  namedExports: NamedImport[] = [];
  hasBareImport: boolean = false;
  exportStarNames: Identifier[] = [];
  hasStarExport: boolean = false;
}

interface ExportInfo {
  localName: Identifier;
  exportedName: Identifier | StringLiteral;
}

function mapGet<K, V>(map: Map<K, V>, key: K, getDefault: () => V): V {
  if (map.has(key)) {
    return map.get(key)!;
  }
  const value = getDefault();
  map.set(key, value);
  return value;
}

/**
 * Class responsible for preprocessing and bookkeeping import and export declarations within the
 * file.
 *
 * TypeScript uses a simpler mechanism that does not use functions like interopRequireDefault and
 * interopRequireWildcard, so we also allow that mode for compatibility.
 */
export function processImport(code: string) {
  const file = parse(code, true, true, false);
  const { tokens } = file;

  let i = 0;

  function isContextualKeywordAt(
    index: number,
    contextualKeyword: ContextualKeyword,
  ) {
    const token = tokens[index];
    return (
      token.type === tt.name && token.contextualKeyword === contextualKeyword
    );
  }

  function getIdentifierOrString(index: number): Identifier | StringLiteral {
    const token = tokens[index];
    const { start, end, type } = token;
    switch (type) {
      case tt.name:
        return {
          start: token.start,
          end: token.end,
          name: code.slice(start, end),
        };
      case tt.string:
        return {
          start: token.start,
          end: token.end,
          value: code.slice(start, end),
        };
      default:
        throw new Error("Expected identifier or string.");
    }
  }

  function getIdentifierNameAt(index: number): Identifier {
    const { start, end } = tokens[index];
    return { start, end, name: code.slice(start, end) };
  }

  function getStringValue(): string {
    const { start, end, type } = tok();
    if (type !== tt.string) {
      throw new Error("Expected string");
    }
    return code.slice(start + 1, end - 1);
  }

  const is = (type: TokenType) => tok().type === type;

  function eat(type: TokenType): boolean {
    if (is(type)) {
      i++;
      return true;
    }
    return false;
  }

  const tok = () => tokens[i];
  const next = (by: number) => tokens[i + by];

  const matches2AtIndex = (t1: TokenType, t2: TokenType) =>
    tok().type === t1 && next(1).type === t2;

  const matches3AtIndex = (
    t1: TokenType,
    t2: TokenType,
    t3: TokenType,
  ): boolean => tok().type === t1 && next(1).type === t2 && next(2).type === t3;

  const importInfoByPath = new Map<string, ImportInfo>();
  const exportInfos: ExportInfo[] = [];

  const importDeclarations: (ImportDeclarationSpecifier &
    ImportDeclarationBase)[] = [];
  // const exportDeclarations: ExportDeclaration[] = [];

  /**
   * Determine information about this named import or named export specifier.
   *
   * This syntax is the `a` from statements like these:
   * import {A} from "./foo";
   * export {A};
   * export {A} from "./foo";
   *
   * As it turns out, we can exactly characterize the syntax meaning by simply
   * counting the number of tokens, which can be from 1 to 4:
   * {A}
   * {type A}
   * {A as B}
   * {type A as B}
   */
  function getImportExportSpecifierInfo(): NamedImport {
    const start = i;

    if (moveAndCheckNextSpecifierEnd()) {
      // import {A}
      const name = getIdentifierNameAt(start);
      return new NamedImport(ImportKind.Value, name, name);
    }
    if (moveAndCheckNextSpecifierEnd()) {
      // import {type A}
      const name = getIdentifierNameAt(start + 1);
      return new NamedImport(ImportKind.Type, name, name);
    }
    if (moveAndCheckNextSpecifierEnd()) {
      // import {A as B}
      return new NamedImport(
        ImportKind.Value,
        getIdentifierOrString(start),
        getIdentifierNameAt(start + 2),
      );
    }
    if (moveAndCheckNextSpecifierEnd()) {
      // import {type A as B}
      return new NamedImport(
        ImportKind.Type,
        getIdentifierOrString(start + 1),
        getIdentifierNameAt(start + 3),
      );
    }

    throw new Error(
      `Unexpected import/export specifier at ${i}: ` +
        tokens
          .slice(i - 1, i + 4)
          .map(t => code.slice(t.start, t.end))
          .join(" "),
    );
  }

  function moveAndCheckNextSpecifierEnd(): boolean {
    i++;
    const token = tok();
    return token.type === tt.braceR || token.type === tt.comma;
  }

  function preprocessImportAtIndex(): void {
    const defaultNames: Identifier[] = [];
    const wildcardNames: Identifier[] = [];
    const namedImports: NamedImport[] = [];

    let importKind = ImportKind.Value;

    const specifiers: ImportDeclarationSpecifier[] = [];

    i++;

    if (
      (isContextualKeywordAt(i, ContextualKeyword._type) || is(tt._typeof)) &&
      next(1).type !== tt.comma &&
      !isContextualKeywordAt(i + 1, ContextualKeyword._from)
    ) {
      importKind = ImportKind.Type;
      i++;
    }

    if (is(tt.parenL)) {
      /** @todo Dynamic import */
      return;
    }

    if (is(tt.name)) {
      specifiers.push({
        type: ImportSpecifierKind.Default,
        local: getIdentifierNameAt(i),
      });

      i++;
      eat(tt.comma);
    }

    if (is(tt.star)) {
      // * as
      i += 2;
      wildcardNames.push(getIdentifierNameAt(i));
      specifiers.push({
        type: ImportSpecifierKind.Namespace,
        local: getIdentifierNameAt(i),
      });

      i++;
    }

    if (eat(tt.braceL)) {
      for (const namedImport of getNamedImports()) {
        // Treat {default as X} as a default import to ensure usage of require interop helper
        if ((namedImport.importedName as Identifier).name === "default") {
          defaultNames.push(namedImport.localName);
        } else {
          namedImports.push(namedImport);
        }
        specifiers.push({
          type: ImportSpecifierKind.Named,
          imported: namedImport.importedName,
          local: namedImport.localName,
        });
      }
    }

    if (isContextualKeywordAt(i, ContextualKeyword._from)) {
      i++;
    }

    const sourceText = getStringValue();
    const { start, end } = tok();
    const source: StringLiteral = { start, end, value: sourceText };

    if (next(1).type === tt.semi) {
      i++;
    }

    // (spec as any).code = code.slice(spec.start, spec.end);
    importDeclarations.push(
      ...specifiers.map(spec => ({
        ...spec,
        importKind,
        source,
      })),
    );

    const importInfo = getImportInfo(sourceText);
    importInfo.defaultNames.push(...defaultNames);
    importInfo.wildcardNames.push(...wildcardNames);
    importInfo.namedImports.push(...namedImports);
    if (
      defaultNames.length === 0 &&
      wildcardNames.length === 0 &&
      namedImports.length === 0
    ) {
      importInfo.hasBareImport = true;
    }
  }

  function preprocessExportAtIndex(): void {
    if (!eat(tt._export)) return;

    switch (tok().type) {
      case tt._var:
      case tt._let:
      case tt._const:
        preprocessVarExportAtIndex();
        break;
      case tt._function:
      case tt._class:
        const exportedName = getIdentifierNameAt(i + 1);
        exportInfos.push({ localName: exportedName, exportedName });
        break;
      case tt.name:
        if (next(1).type === tt._function) {
          const exportedName = getIdentifierNameAt(i + 2);
          exportInfos.push({ localName: exportedName, exportedName });
        }
        break;
      case tt.braceL:
        preprocessNamedExportAtIndex();
        break;
      case tt.star:
        preprocessExportStarAtIndex();
        break;
    }
  }

  function preprocessVarExportAtIndex(): void {
    let depth = 0;
    // Handle cases like `export let {x} = y;`, starting at the open-brace in that case.
    for (let j = i + 1; ; j++) {
      const token = tokens[j];
      if (
        token.type === tt.braceL ||
        token.type === tt.dollarBraceL ||
        token.type === tt.bracketL
      ) {
        depth++;
      } else if (token.type === tt.braceR || token.type === tt.bracketR) {
        depth--;
      } else if (depth === 0 && token.type !== tt.name) {
        break;
        /** @todo This looks wrong */
      } else if (tokens[1].type === tt.eq) {
        const endIndex = tokens[0].rhsEndIndex;
        if (endIndex == null) {
          throw new Error("Expected = token with an end index.");
        }
        j = endIndex - 1;
      }
    }
  }

  /**
   * Walk this export statement just in case it's an export...from statement.
   * If it is, combine it into the import info for that path. Otherwise, just
   * bail out; it'll be handled later.
   */
  function preprocessNamedExportAtIndex(): void {
    // export {
    i += 1;
    const namedImports = Array.from(getNamedImports());

    if (isContextualKeywordAt(i, ContextualKeyword._from)) {
      i++;
    } else {
      // Reinterpret "a as b" to be local/exported rather than imported/local.
      for (const {
        importedName: localName,
        localName: exportedName,
      } of namedImports) {
        exportInfos.push({ localName: localName as Identifier, exportedName });
      }
      return;
    }

    getImportInfo(getStringValue()).namedExports.push(...namedImports);
  }

  function preprocessExportStarAtIndex(): void {
    let exportedName = null;
    if (matches2AtIndex(tt.star, tt._as)) {
      // export * as
      i += 2;
      exportedName = getIdentifierNameAt(i);
      // foo from
      i += 2;
    } else {
      // export * from
      i += 2;
    }
    if (!is(tt.string)) {
      throw new Error(
        "Expected string token at the end of star export statement.",
      );
    }
    const importInfo = getImportInfo(getStringValue());
    if (exportedName !== null) {
      importInfo.exportStarNames.push(exportedName);
    } else {
      importInfo.hasStarExport = true;
    }
  }

  function* getNamedImports() {
    while (true) {
      if (eat(tt.braceR)) {
        break;
      }

      yield getImportExportSpecifierInfo();

      if (matches2AtIndex(tt.comma, tt.braceR)) {
        i += 2;
        break;
      } else if (eat(tt.braceR)) {
        break;
      } else if (eat(tt.comma)) {
        // noop
      } else {
        throw new Error(`Unexpected token: ${JSON.stringify(tok())}`);
      }
    }
  }

  function getImportInfo(path: string): ImportInfo {
    return mapGet(importInfoByPath, path, () => new ImportInfo());
  }

  for (; i < tokens.length; i++) {
    if (is(tt._import) && !matches3AtIndex(tt._import, tt.name, tt.eq)) {
      preprocessImportAtIndex();
    } else if (is(tt._export) && !matches2AtIndex(tt._export, tt.eq)) {
      preprocessExportAtIndex();
    }
  }

  return {
    importInfoByPath,
    exportBindingsByLocalName: exportInfos,
    importDeclarations,
  };
}
