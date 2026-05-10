import "dotenv/config"
import { defineConfig } from "prisma/config"

export default defineConfig({
    earlyAccess: true,
    schema: "prisma/schema.prisma",

    datasource: {
        url: process.env.DATABASE_URL_DIRECT!,
    },

    migrate: {
        async adapter() {
            const { neonConfig, Pool } = await import("@neondatabase/serverless")
            const { PrismaNeon } = await import("@prisma/adapter-neon")
            const ws = (await import("ws")).default

            neonConfig.webSocketConstructor = ws

            const pool = new Pool({
                connectionString: process.env.DATABASE_URL_DIRECT!,
            })

            return new PrismaNeon(pool)
        },
    },
})