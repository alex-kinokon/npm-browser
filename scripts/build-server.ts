#!/usr/bin/env -S node -r esbuild-register
import { promises as fs } from "node:fs"
import esbuild from "esbuild"
import nodemon from "nodemon"
import { dependencies, devDependencies } from "../package.json"

const args = process.argv.slice(2)
const ENV = process.env.NODE_ENV || "development"
const EXECUTE = Boolean(process.env.EXECUTE)
const PROD = ENV === "production"
const WATCH = args.includes("-w") || args.includes("--watch") || EXECUTE

const external = new Set([
  ...Object.keys(dependencies),
  ...(!PROD ? Object.keys(devDependencies) : []),
])

async function main() {
  const outfile = "dist/server/index.js"

  const context = await esbuild.context({
    bundle: true,
    stdin: {
      loader: "js",
      resolveDir: ".",
      contents: /* js */ `
        import { main } from "./src/pages/api/main";

        main().catch(err => {
          console.error(err)
          process.exit(1)
        });
      `,
    },
    external: Array.from(external),
    format: "iife",
    legalComments: "none",
    metafile: PROD,
    minify: PROD && !process.env.DEBUG,
    outfile,
    platform: "node",
    sourcemap: true,
    banner: {
      js: `#!/usr/bin/env node`,
    },
    plugins: [],
    define: {
      "process.env.NODE_ENV": JSON.stringify(ENV),
      __DEV__: String(ENV === "development"),
      __PROD__: String(ENV === "production"),
    },
  })

  const build = await context.rebuild()
  if (PROD) {
    await fs.writeFile("dist/server/meta.json", JSON.stringify(build.metafile))
  }

  if (EXECUTE) {
    nodemon({
      script: outfile,
      watch: [outfile],
      ext: "mjs",
    }).on("quit", () => {
      process.stdout.write("\n")
      process.exit()
    })
  }

  await fs.chmod(outfile, 0o755)

  if (WATCH) {
    await context.watch()
  } else {
    await context.dispose()
  }
}

main()
