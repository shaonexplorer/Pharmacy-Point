import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  output: './generated/prisma-client',
});