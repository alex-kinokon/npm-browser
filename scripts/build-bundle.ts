#!/usr/bin/env -S node -r esbuild-register
import { promises as fs, readFileSync } from "node:fs"
import esbuild from "esbuild"
import glob from "fast-glob"

async function main() {
  const outfile = "bundle.generated.js"

  const assets = glob
    .sync(["assets/**/*", "index.html"], {
      dot: true,
      onlyFiles: true,
      cwd: "dist",
    })
    .map(file => ["/" + file, readFileSync("dist/" + file).toString("base64")])

  const context = await esbuild.context({
    bundle: true,
    stdin: {
      resolveDir: process.cwd(),
      loader: "ts",
      contents: /* js */ `
        import { fs } from "memfs";
        import { dirname } from "path";
        import { main } from "./src/pages/api/main";

        const assets = JSON.parse(${JSON.stringify(JSON.stringify(assets))});
        for (const [path, content] of assets) {
          fs.mkdirSync(dirname(path), { recursive: true })
          fs.writeFileSync(path, Buffer.from(content, "base64"))
        }

        main().catch(err => {
          console.error(err)
          process.exit(1)
        });
      `,
    },
    format: "iife",
    legalComments: "none",
    metafile: true,
    minify: !process.env.DEBUG,
    external: [],
    outfile,
    platform: "node",
    sourcemap: false,
    banner: {
      js: `#!/usr/bin/env node`,
    },
    plugins: [
      {
        name: "memfs",
        setup(build) {
          const memfs = require.resolve("memfs")
          build.onResolve({ filter: /^(node:)?fs$/ }, () => ({ path: memfs }))
        },
      },
    ],
    define: {
      "process.env.NODE_ENV": '"production"',
      "process.env.ASSETS_DIR": '"/"',
      __DEV__: "false",
      __PROD__: "true",
    },
  })

  const build = await context.rebuild()
  await fs.writeFile("bundle.meta.generated.json", JSON.stringify(build.metafile))
  await fs.chmod(outfile, 0o755)
  await context.dispose()
}

main()
