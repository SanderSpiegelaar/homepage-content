import "server-only"

import { mkdirSync } from "node:fs"
import { dirname } from "node:path"
import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"

import * as schema from "@/lib/auth-schema"

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) throw new Error("DATABASE_URL is required")

mkdirSync(dirname(databaseUrl), { recursive: true })

const client = new Database(databaseUrl)

export const db = drizzle({ client, schema })
