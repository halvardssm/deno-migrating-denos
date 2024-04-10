import {
  type InheritedMigrationClientOptions,
  MigrationClient,
} from "../lib/mod.ts";
import { PostgresConnection } from "@db/sqlx/clients/postgres";

export type PostgresMigrationClientOptions = InheritedMigrationClientOptions<
  typeof PostgresConnection
>;

/**
 * Postgres client
 */
export class PostgresMigrationClient
  extends MigrationClient<typeof PostgresConnection> {
  constructor(options: PostgresMigrationClientOptions) {
    super({
      dialect: "postgres",
      client: options.client ??
        new PostgresConnection(...options.clientOptions!),
      queries: {
        migrationTableExists: (ctx) =>
          `SELECT * FROM information_schema.tables WHERE table_name = '${ctx.table}' LIMIT 1;`,
        createMigrationTable: (ctx) =>
          `CREATE TABLE ${ctx.table} (${ctx.columnId} bigserial PRIMARY KEY, ${ctx.columnFileName} varchar(${ctx.maxFileNameLength}) UNIQUE, ${ctx.columnCreatedAt} timestamp (0) default current_timestamp);`,
        ...options.queries,
      },
    });
  }
}
