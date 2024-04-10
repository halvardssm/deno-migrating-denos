import {
  type InheritedMigrationClientOptions,
  MigrationClient,
} from "../lib/mod.ts";
import { SqLiteConnection } from "@db/sqlx/clients/sqlite";

export type SqLiteMigrationClientOptions = InheritedMigrationClientOptions<
  typeof SqLiteConnection
>;

/** SQLite client */
export class SqLiteMigrationClient
  extends MigrationClient<typeof SqLiteConnection> {
  constructor(options: SqLiteMigrationClientOptions) {
    const { queries, client, clientOptions, ...rest } = options;
    if (!client && !clientOptions) {
      throw new Error(
        "You must provide either a client or clientOptions to the SqLiteMigrationClient constructor.",
      );
    }
    super({
      ...rest,
      client: client ?? new SqLiteConnection(...clientOptions!),
      dialect: "sqlite",
      queries: {
        migrationTableExists: (ctx) =>
          `SELECT name FROM sqlite_master WHERE type='table' AND name='${ctx.table}';`,
        createMigrationTable: (ctx) =>
          `CREATE TABLE ${ctx.table} (${ctx.columnId} integer NOT NULL PRIMARY KEY autoincrement, ${ctx.columnFileName} varchar(${ctx.maxFileNameLength}) UNIQUE, ${ctx.columnCreatedAt} datetime NOT NULL DEFAULT CURRENT_TIMESTAMP);`,
        ...queries,
      },
    });
  }
}
