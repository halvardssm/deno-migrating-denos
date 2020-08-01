import { ConnectionOptions } from "https://deno.land/x/postgres@v0.4.2/connection_params.ts";
import { Client } from "https://deno.land/x/postgres@v0.4.2/mod.ts";
import { QueryResult } from "https://deno.land/x/postgres@v0.4.2/query.ts";
import { AbstractClient } from "./AbstractClient.ts";
import {
  AmountMigrateT,
  AmountRollbackT,
  ClientI,
  QueryT,
  ClientOptions,
  DBDialects,
} from "../types.ts";

/** PostgreSQL client */
export class ClientPostgreSQL extends AbstractClient implements ClientI {
  private client: Client;
  dialect: DBDialects = "pg";

  private QUERY_MIGRATION_TABLE_EXISTS = `SELECT to_regclass('${this.TABLE_MIGRATIONS}');`;

  private QUERY_CREATE_MIGRATION_TABLE = `CREATE TABLE ${this.TABLE_MIGRATIONS} (id bigserial PRIMARY KEY, ${this.COL_FILE_NAME} varchar(${AbstractClient.MAX_FILE_NAME_LENGTH}) UNIQUE, ${this.COL_CREATED_AT} timestamp (0) default current_timestamp);`;

  constructor(
    options: string | ClientOptions,
    connectionOptions: ConnectionOptions
  ) {
    super(options);
    this.client = new Client(connectionOptions);
  }

  async prepare() {
    await this.client.connect();

    const queryResult = (await this.query(
      this.QUERY_MIGRATION_TABLE_EXISTS
    )) as QueryResult;

    const migrationTableExists =
      queryResult.rows?.[0]?.[0] === this.TABLE_MIGRATIONS;

    if (!migrationTableExists) {
      await this.query(this.QUERY_CREATE_MIGRATION_TABLE);
      console.info("Database setup complete");
    }
  }

  async query(query: QueryT) {
    try {
      if (typeof query === "string") {
        return await this.client.query(query);
      } else {
        return await this.client.multiQuery(query.map((el) => ({ text: el })));
      }
    } catch (e) {
      throw new Error("Error:" + query + "\n" + e);
    }
  }

  async close() {
    await this.client.end();
  }

  async migrate(amount: AmountMigrateT) {
    const latestMigration = (await this.query(
      this.QUERY_GET_LATEST
    )) as QueryResult;
    await super.migrate(
      amount,
      latestMigration.rows?.[0]?.[0],
      this.query.bind(this)
    );
  }

  async rollback(amount: AmountRollbackT) {
    const allMigrations = (await this.query(this.QUERY_GET_ALL)) as QueryResult;

    await super.rollback(
      amount,
      allMigrations.rows?.flatMap((el) => el?.[0]),
      this.query.bind(this)
    );
  }

  async seed(matcher?: string) {
    await super.seed(matcher, this.query.bind(this));
  }
}
