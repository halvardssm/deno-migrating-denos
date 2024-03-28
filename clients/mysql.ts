import {
  type InheritedMigrationClientOptions,
  MigrationClient,
} from "../lib/mod.ts";
import { MySqlConnection } from "@db/sqlx/mysql";

export type MySqlMigrationClientOptions = InheritedMigrationClientOptions<
  typeof MySqlConnection
>;

/**
 * MySQL client
 *
 * This is for MySQL versions >5.5, if you want to use version <=5.5,
 * use ClientMySQL55 instead.
 */
export class MySqlMigrationClient
  extends MigrationClient<typeof MySqlConnection> {
  constructor(options: MySqlMigrationClientOptions) {
    super({
      dialect: "mysql",
      client: options.client ?? new MySqlConnection(...options.clientOptions!),
      queries: {
        migrationTableExists: (ctx) =>
          `SELECT * FROM information_schema.tables WHERE table_name = '${ctx.table}' LIMIT 1;`,
        createMigrationTable: (ctx) =>
          `CREATE TABLE ${ctx.table} (${ctx.columnId} bigint UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, ${ctx.columnFileName} varchar(${ctx.maxFileNameLength}) NOT NULL UNIQUE, ${ctx.columnCreatedAt} datetime NOT NULL DEFAULT CURRENT_TIMESTAMP);`,
        ...options.queries,
      },
    });
  }
}
