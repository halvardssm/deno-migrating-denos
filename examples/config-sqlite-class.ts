import { type NessieConfig, SqLiteMigrationClient } from "../mod.ts";
import { SqLiteConnection } from "@db/sqlx";

const config: NessieConfig = {
  client: new SqLiteMigrationClient({
    client: new SqLiteConnection("./sqlite.db"),
  }),
  migrationFolders: ["./db/migrations"],
  seedFolders: ["./db/seeds"],
};

export default config;
