import { defineBuildConfig } from 'unbuild'
import { promises as fsp } from "node:fs";
import { join } from "path";

export default defineBuildConfig({
  entries: [
    'src/index.ts',
    'src/node.ts',
    { input: 'src/runtime/utils/', outDir: 'dist/runtime/utils', ext: 'mjs' },
    { input: 'src/runtime/bin/', outDir: 'dist/runtime/bin', ext: 'mjs' },
  ],
  // Generates .d.ts declaration file
  declaration: true,
  failOnWarn: false,
  dependencies: [
    'fast-glob',
    'lodash-es'
  ],
  externals: [
    'ofetch',
    'vue'
  ],
  hooks: {
    "build:done": async () => {  
      await fsp.chmod(join(__dirname, 'dist/runtime/utils/cli.mjs'), 0o755 /* rwx r-x r-x */).catch(() => {});
    }
  }
})
