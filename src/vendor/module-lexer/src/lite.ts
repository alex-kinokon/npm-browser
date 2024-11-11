#!/usr/bin/env tsx
// https://github.com/alangpierce/sucrase/commit/b9e563f0fc869b6085ced4df5459b80be8cdab7f
import {
  ContextualKeyword,
  type TokenType,
  parse,
  TokenType as tt,
} from "./vendor/sucrase";

/**
 * Class responsible for preprocessing and bookkeeping import and export declarations within the
 * file.
 *
 * TypeScript uses a simpler mechanism that does not use functions like interopRequireDefault and
 * interopRequireWildcard, so we also allow that mode for compatibility.
 */
export function getImportedModules(code: string): string[] {
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

  const importedModules = new Set<string>();

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
  function getImportExportSpecifierInfo(): void {
    if (
      moveAndCheckNextSpecifierEnd() ||
      // import {A}
      moveAndCheckNextSpecifierEnd() ||
      // import {type A}
      moveAndCheckNextSpecifierEnd() ||
      // import {A as B}
      moveAndCheckNextSpecifierEnd()
      // import {type A as B}
    ) {
      return;
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
    i++;

    if (
      (isContextualKeywordAt(i, ContextualKeyword._type) || is(tt._typeof)) &&
      next(1).type !== tt.comma &&
      !isContextualKeywordAt(i + 1, ContextualKeyword._from)
    ) {
      i++;
    }

    if (eat(tt.parenL)) {
      if (is(tt.string)) {
        importedModules.add(getStringValue());
        i++;
      }

      /** @todo Dynamic import */
      return;
    }

    if (is(tt.name)) {
      i++;
      eat(tt.comma);
    }

    if (is(tt.star)) {
      // * as
      i += 3;
    }

    if (eat(tt.braceL)) {
      getNamedImports();
    }

    if (isContextualKeywordAt(i, ContextualKeyword._from)) {
      i++;
    }

    const sourceText = getStringValue();
    if (next(1).type === tt.semi) {
      i++;
    }

    importedModules.add(sourceText);
  }

  function preprocessExportAtIndex(): void {
    if (!eat(tt._export)) return;

    switch (tok().type) {
      case tt._var:
      case tt._let:
      case tt._const:
      case tt._function:
      case tt._class:
      case tt.name:
        break;
      case tt.braceL:
        preprocessNamedExportAtIndex();
        break;
      case tt.star:
        preprocessExportStarAtIndex();
        break;
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
    getNamedImports();

    if (isContextualKeywordAt(i, ContextualKeyword._from)) {
      i++;
    } else {
      return;
    }

    importedModules.add(getStringValue());
  }

  function preprocessExportStarAtIndex(): void {
    if (is(tt.star) && next(1).type === tt._as) {
      // export * as
      i += 4;
    } else {
      // export * from
      i += 2;
    }
    if (!is(tt.string)) {
      throw new Error(
        "Expected string token at the end of star export statement.",
      );
    }
    importedModules.add(getStringValue());
  }

  function getNamedImports() {
    while (true) {
      if (eat(tt.braceR)) {
        break;
      }

      getImportExportSpecifierInfo();

      if (is(tt.comma) && next(1).type === tt.braceR) {
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

  for (; i < tokens.length; i++) {
    const t = tok();
    if (t.type === tt._import) {
      if (next(1).type === tt.name && next(2).type === tt.eq) {
        // 0: import, 1: a, 2: =, 3: require, 4: (, 5: "a", 6: )
        i += 5;
        const name = getStringValue();
        if (is(tt.semi)) {
          i++;
        }
        importedModules.add(name);
      } else {
        preprocessImportAtIndex();
      }
    } else if (
      t.type === tt.name &&
      code.slice(t.start, t.end) === "require" &&
      next(1).type === tt.parenL &&
      next(2).type === tt.string
    ) {
      i += 2;
      const name = getStringValue();
      i++;
      eat(tt.semi);
      importedModules.add(name);
    } else if (t.type === tt._export && next(1).type !== tt.eq) {
      preprocessExportAtIndex();
    }
  }

  return Array.from(importedModules);
}
