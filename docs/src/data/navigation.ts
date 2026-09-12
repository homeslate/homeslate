import type { DocsSearchItem, SidebarSection } from '@var-ui/docs';

export const docsSidebarSections: SidebarSection[] = [
  {
    title: 'Guides',
    items: [{ text: 'Overview', link: '/docs' }],
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
];
