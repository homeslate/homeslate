import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = join(dirname(fileURLToPath(import.meta.url)), '../dist');

function jsFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith('.js'))
    .map((name) => join(dir, name));
}

function cssModuleMaps(source: string): Array<{ file: string; binding: string; object: string }> {
  const maps: Array<{ file: string; binding: string; object: string }> = [];
  const re = /\/\/ (.+\.module\.css)\n(?:\/\/ .+\n)*var (\w+) = (\{[\s\S]*?\});/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source))) {
    maps.push({ file: match[1], binding: match[2], object: match[3] });
  }
  return maps;
}

describe('published CSS modules', () => {
  it('emits non-empty class maps from *.module.css so widget layouts apply', () => {
    const files = jsFiles(distDir);
    expect(files.length, 'run `npm run build -w @homeslate/widgets` before this test').toBeGreaterThan(0);

    const maps = files.flatMap((file) =>
      cssModuleMaps(readFileSync(file, 'utf8')).map((map) => ({ ...map, from: file })),
    );

    expect(maps.length, 'expected tsup to emit CSS module objects').toBeGreaterThan(0);

    const empty = maps.filter((map) => map.object.replace(/\s/g, '') === '{}');
    expect(empty.map((map) => `${map.file} -> ${map.binding}`)).toEqual([]);
  });

  it('keeps a JS import of extracted CSS so hosts load the rules', () => {
    const files = jsFiles(distDir);
    const imported = files.some((file) => /\.css['"]/.test(readFileSync(file, 'utf8')));
    expect(imported).toBe(true);
  });
});
