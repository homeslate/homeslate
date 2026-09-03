import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** tsconfig files are JSONC, so drop comments before parsing. */
function readJson<T>(relativePath: string): T {
  const source = readFileSync(new URL(relativePath, import.meta.url), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  return JSON.parse(source) as T;
}

describe('reference app build boundary', () => {
  it('uses package-only root tsconfig.app.json (reference has its own solution)', () => {
    const rootApp = readJson<{ include: string[] }>('../../../tsconfig.app.json');
    const rootNode = readJson<{ include: string[] }>('../../../tsconfig.node.json');
    const solution = readJson<{ references: Array<{ path: string }> }>('../../../tsconfig.json');

    for (const entry of rootApp.include) {
      expect(entry).toMatch(/^packages\//);
    }
    expect(rootNode.include).toEqual(['apps/reference/vite.config.ts']);
    for (const reference of solution.references) {
      expect(reference.path).not.toContain('apps/reference');
    }
  });

  it('typechecks its server with Node libs and its web entry with DOM libs', () => {
    const own = readJson<{ references: Array<{ path: string }> }>('../tsconfig.json');
    expect(own.references.map((reference) => reference.path)).toEqual([
      './tsconfig.server.json',
      './tsconfig.web.json',
    ]);

    const server = readJson<{ compilerOptions: { lib: string[]; types: string[] } }>(
      '../tsconfig.server.json',
    );
    expect(server.compilerOptions.lib).not.toContain('DOM');
    expect(server.compilerOptions.types).toContain('node');

    const web = readJson<{ compilerOptions: { lib: string[]; jsx: string } }>(
      '../tsconfig.web.json',
    );
    expect(web.compilerOptions.lib).toContain('DOM');
    expect(web.compilerOptions.jsx).toBe('react-jsx');
  });
});
