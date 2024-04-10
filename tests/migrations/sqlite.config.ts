import { dirname, fromFileUrl, resolve } from "@std/path";
import { SqLiteMigrationClient } from "../../clients/sqlite.ts";

export default {
  client: new SqLiteMigrationClient({
    clientOptions: ["./tests/data/sqlite.db"],
  }),
  migrationFolders: [
    resolve(dirname(fromFileUrl(new URL(import.meta.url))), "sqlite1"),
    resolve(dirname(fromFileUrl(new URL(import.meta.url))), "sqlite2"),
  ],
  seedFolders: [
    resolve(dirname(fromFileUrl(new URL(import.meta.url))), "sqlite1"),
    resolve(dirname(fromFileUrl(new URL(import.meta.url))), "sqlite2"),
  ],
};
