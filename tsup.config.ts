import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { defineConfig } from 'tsup';

const CSS_JS_ENTRIES = ['dist/index.js', 'dist/canvas/index.js'];

export default defineConfig({
  format: 'esm',
  dts: true,
  clean: true,
  loader: {
    '.css': 'local-css',
  },
  async onSuccess() {
    for (const file of CSS_JS_ENTRIES) {
      const css = file.replace(/\.js$/, '.css');
      if (!existsSync(file) || !existsSync(css)) continue;
      const source = readFileSync(file, 'utf8');
      const spec = `./${css.slice(css.lastIndexOf('/') + 1)}`;
      if (source.includes(spec)) continue;
      writeFileSync(file, `import ${JSON.stringify(spec)};\n${source}`);
    }
  },
});
