import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsSchema } from '@var-ui/docs/schema';

const docs = defineCollection({
  loader: glob({ base: './content/docs', pattern: '**/*.{md,mdx}' }),
  schema: docsSchema(),
});

export const collections = { docs };
