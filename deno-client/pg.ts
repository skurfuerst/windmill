import { Client } from "https://deno.land/x/postgres@v0.16.1/mod.ts"
import { type Resource } from "./mod.ts"

/**
 * deno-postgres client API is very flexible:
 * https://deno.land/x/postgres@v0.16.1/mod.ts?s=QueryClient
 * 
 * @param db the postgresql resource to generate the client for
 * 
 * @returns the client for the resource
 * 
 * Usage:
 * Static query:
 * ```ts
 * const {rows} = await pgClient(db).queryObject(
 *   "SELECT ID, NAME FROM CLIENTS"
 * );
 * ```
 * 
 * Prepared Statements:
 * ```ts
 * const { rows } = await pgClient(db).queryObject`SELECT ID, NAME FROM CLIENTS WHERE ID = ${id}`;
 * ```
 */
export function pgClient(
    db: Resource<"postgresql">
) {
    db.database = db.dbname
    db.hostname = db.host
    return new Client(db)
}
