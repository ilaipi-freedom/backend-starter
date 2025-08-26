import { defineConfig } from 'prisma/config';
import { resolve } from 'node:path';
import 'dotenv/config';

export default defineConfig({
  schema: resolve('prisma'),
});
