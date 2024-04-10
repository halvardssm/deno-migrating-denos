import { dirname, fromFileUrl, resolve } from "@std/path";
import { MySqlMigrationClient } from "../../clients/mysql.ts";

export default {
  client: new MySqlMigrationClient({
    clientOptions: ["mysql://root@0.0.0.0:5101/nessie"],
  }),
  migrationFolders: [
    resolve(dirname(fromFileUrl(new URL(import.meta.url))), "mysql1"),
    resolve(dirname(fromFileUrl(new URL(import.meta.url))), "mysql2"),
  ],
  seedFolders: [
    resolve(dirname(fromFileUrl(new URL(import.meta.url))), "mysql1"),
    resolve(dirname(fromFileUrl(new URL(import.meta.url))), "mysql2"),
  ],
};
