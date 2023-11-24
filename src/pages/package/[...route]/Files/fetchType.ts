import { dirname, join, parse, resolve } from "node:path"
import { debounce } from "lodash"
import isCore from "is-core-module"
import * as monaco from "monaco-editor"
import { getImportedModules } from "./getImports"
import type { PackageIdentifier } from "../package"
import { queryClient } from "~/fetch-client"
import { getPackageFile } from "~/remote"
import type { MappedFile } from "./index"

export function intellisense(
  editor: monaco.editor.IStandaloneCodeEditor,
  pkg: PackageIdentifier,
  files: MappedFile[],
  file: MappedFile
) {
  const pathMap = new Map(files.map(file => [file.path, file]))
  const nodeResolve = getResolver(pkg, files, pathMap)

  const fetchTypes = debounce(async () => {
    const model = editor.getModel()!
    const imports = getImportedModules(model.getValue()).filter(p => p.startsWith("."))

    const dir = dirname(file.path)
    const importedPaths = await Promise.all(imports.map(path => nodeResolve(path, dir)))

    await Promise.all(
      importedPaths.map(async path => {
        const hex = pathMap.get(path)?.hex
        if (!hex) return

        const source = await queryClient.fetchQuery(getPackageFile(pkg.name, hex))

        const uri = monaco.Uri.parse(path)
        if (!monaco.editor.getModel(uri)) {
          monaco.editor.createModel(source, undefined, uri)
        }
      })
    )
  }, 100)

  void fetchTypes()

  return editor.onDidChangeModelContent(fetchTypes)
}

function getNodeModulesDirs(absoluteStart: string) {
  let prefix = "/"
  if (/^([A-Za-z]:)/.test(absoluteStart)) {
    prefix = ""
  } else if (/^\\\\/.test(absoluteStart)) {
    prefix = "\\\\"
  }

  const paths = [absoluteStart]
  let parsed = parse(absoluteStart)
  while (parsed.dir !== paths.at(-1)) {
    paths.push(parsed.dir)
    parsed = parse(parsed.dir)
  }

  return paths.map(p => resolve(prefix, p, "node_modules"))
}

const extensions = [".js", ".ts", ".d.ts", ".tsx", ".cjs", ".mts", ".mjs", ".cjs"]

function getResolver(
  pkg: PackageIdentifier,
  files: MappedFile[],
  pathMap: Map<string, MappedFile>
) {
  const dirs = new Set<string>(files.map(file => dirname(file.path)))

  async function readFile(file: string) {
    const { hex } = pathMap.get(file)!
    return await queryClient.fetchQuery(getPackageFile(pkg.name, hex))
  }

  function loadAsFileSync(x: string) {
    if (pathMap.has(x)) return x

    for (const extension of extensions) {
      const file = x + extension
      if (pathMap.has(file)) {
        return file
      }
    }
  }

  async function loadAsDirectory(x: string): Promise<string | undefined> {
    const pkgFile = join(x, "/package.json")
    if (pathMap.has(pkgFile)) {
      let pkg
      try {
        pkg = JSON.parse(await readFile(pkgFile))
      } catch {}

      if (pkg?.main) {
        if (pkg.main === "." || pkg.main === "./") {
          pkg.main = "index"
        }
        try {
          const mainPath = resolve(x, pkg.main)
          const m = loadAsFileSync(mainPath)
          if (m) return m
          const n = await loadAsDirectory(mainPath)
          if (n) return n
          const checkIndex = loadAsFileSync(resolve(x, "index"))
          if (checkIndex) return checkIndex
        } catch {}
        throw new Error(
          `Cannot find module '${resolve(
            x,
            pkg.main
          )}'. Please verify that the package.json has a valid "main" entry`
        )
      }
    }

    return loadAsFileSync(join(x, "/index"))
  }

  async function loadNodeModulesSync(x: string, start: string) {
    for (const dir of getNodeModulesDirs(start).map(dir => join(dir, x))) {
      if (dirs.has(dirname(dir))) {
        const m = loadAsFileSync(dir)
        if (m) return m
        const n = await loadAsDirectory(dir)
        if (n) return n
      }
    }
  }

  return async (x: string, basedir: string): Promise<string> => {
    const absoluteStart = resolve(basedir)

    if (basedir && !dirs.has(absoluteStart)) {
      throw new TypeError(
        `Provided basedir "${basedir}" is not a directory, or a symlink to a directory`
      )
    }

    if (/^(?:\.\.?(?:\/|$)|\/|([A-Za-z]:)?[/\\])/.test(x)) {
      let res = resolve(absoluteStart, x)
      if (x === "." || x === ".." || x.slice(-1) === "/") res += "/"
      const m = loadAsFileSync(res) || (await loadAsDirectory(res))
      if (m) return m
    } else if (isCore(x)) {
      return x
    } else {
      const n = await loadNodeModulesSync(x, absoluteStart)
      if (n) return n
    }

    throw new Error(`Cannot find module '${x}' from '${basedir}'`)
  }
}
