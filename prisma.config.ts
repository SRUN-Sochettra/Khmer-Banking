import "dotenv/config"
import { defineConfig } from "prisma/config"

export default defineConfig({
    schema: "prisma/schema.prisma",

    datasource: {
        url: process.env.DATABASE_URL_DIRECT!,
    },

    migrations: {
      seed: 'npx tsx prisma/seed.ts',
    }
})
