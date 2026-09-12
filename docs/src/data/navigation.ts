import type { DocsSearchItem, SidebarSection } from '@var-ui/docs';

export const docsSidebarSections: SidebarSection[] = [
  {
    title: 'Guides',
    items: [
      { text: 'Overview', link: '/docs' },
      { text: 'Getting started', link: '/docs/getting-started' },
      { text: 'Reference app', link: '/docs/reference' },
      { text: 'Packages', link: '/docs/packages' },
      { text: 'Releasing', link: '/docs/releasing' },
    ],
  },
];

export const docsSearchItems: DocsSearchItem[] = [
  {
    id: 'docs',
    title: 'Overview',
    meta: 'Guides',
    keywords: ['docs', 'homeslate'],
    group: 'Guides',
  },
  {
    id: 'getting-started',
    title: 'Getting started',
    meta: 'Guides',
    keywords: ['start', 'clone', 'install', 'quickstart'],
    group: 'Guides',
  },
  {
    id: 'reference',
    title: 'Reference app',
    meta: 'Guides',
    keywords: ['self-host', 'kiosk', 'sqlite', 'google'],
    group: 'Guides',
  },
  {
    id: 'packages',
    title: 'Packages',
    meta: 'Guides',
    keywords: ['npm', 'schema', 'widgets', 'editor', 'display'],
    group: 'Guides',
  },
  {
    id: 'releasing',
    title: 'Releasing',
    meta: 'Guides',
    keywords: ['changeset', 'publish', 'npm'],
    group: 'Guides',
  },
];
