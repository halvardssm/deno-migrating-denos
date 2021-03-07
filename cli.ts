import { State } from "./cli/state.ts";
import { Denomander, format, resolve } from "./deps.ts";
import {
  REGEX_MIGRATION_FILE_NAME,
  URL_TEMPLATE_BASE,
  VERSION,
} from "./consts.ts";

/** Initializes Denomander */
const initDenomander = () => {
  const program = new Denomander({
    app_name: "Nessie Migrations",
    app_description: "A database migration tool for Deno.",
    app_version: VERSION,
  });

  program
    .globalOption("-d --debug", "Enables verbose output")
    .globalOption(
      "-c --config",
      "Path to config file, will default to ./nessie.config.ts",
    )
    .command("init", "Generates the config file")
    .command("make [fileName]", "Creates a migration file with the name")
    .command("make:seed [fileName]", "Creates a seed file with the name")
    .command(
      "seed [matcher?]",
      "Seeds the database with the files found with the matcher in the seed folder specified in the config file. Matcher is optional, and accepts string literals and RegExp",
    )
    .command(
      "migrate [amount?]",
      "Migrates migrations. Optional number of migrations. If not provided, it will do all available.",
    )
    .command(
      "rollback [amount?]",
      "Rolls back migrations. Optional number of rollbacks. If not provided, it will do one.",
    )
    .command(
      "update_timestamps",
      "Update the timestamp format from milliseconds to timestamp. This command should be run inside of the folder where you store your migrations.",
    );

  program.parse(Deno.args);

  return program;
};

/** Initializes Nessie */
const initNessie = async () => {
  const responseFile = await fetch(URL_TEMPLATE_BASE + "config.ts");

  await Deno.writeTextFile(
    resolve(Deno.cwd(), "nessie.config.ts"),
    await responseFile.text(),
  );

  await Deno.mkdir(resolve(Deno.cwd(), "db/migrations"), { recursive: true });
  await Deno.mkdir(resolve(Deno.cwd(), "db/seeds"), { recursive: true });
  await Deno.create(resolve(Deno.cwd(), "db/migrations/.gitkeep"));
  await Deno.create(resolve(Deno.cwd(), "db/seeds/.gitkeep"));
};

const updateTimestamps = () => {
  const migrationFiles = [...Deno.readDirSync(Deno.cwd())];

  migrationFiles
    .filter((el) => el.isFile && REGEX_MIGRATION_FILE_NAME.test(el.name))
    .map((el) => {
      const milliseconds = el.name.split("-", 1)[0];
      const timestamp = new Date(milliseconds);
      const newName = format(timestamp, "yyyyMMddHHmmss");

      return {
        oldName: el.name,
        newName,
      };
    })
    .forEach(({ oldName, newName }) => {
      Deno.renameSync(oldName, newName);
    });
};

/** Main application */
const run = async () => {
  try {
    const prog = initDenomander();

    if (prog.init) {
      await initNessie();
    } else if (prog.update_timestamps) {
      updateTimestamps();
    } else {
      const state = await new State(prog).init();

      if (prog.make) {
        await state.makeMigration(prog.fileName);
      } else if (prog["make:seed"]) {
        await state.makeSeed(prog.fileName);
      } else {
        await state.client!.prepare();

        if (prog.migrate) {
          await state.client!.migrate(prog.amount);
        } else if (prog.rollback) {
          await state.client!.rollback(prog.amount);
        } else if (prog.seed) {
          await state.client!.seed(prog.matcher);
        }

        await state.client!.close();
      }
    }

    Deno.exit();
  } catch (e) {
    console.error(e);
    Deno.exit(1);
  }
};

run();
