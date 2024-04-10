import { yellow } from "@std/fmt/colors";
import { NessieError } from "./lib/utils/errors.ts";
import { mainCommand } from "./lib/cli/commands.ts";

/**
 * Allows running Nessie programatically
 *
 * @param args Arguments to pass to the program, defaults to Deno.args
 * @param withExit Whether to exit the program after running the command, defaults to true
 *
 * @example
 * ```ts
 * import { runNessie } from "@halvardm/nessie/cli";
 *
 * await runNessie(["migrate"]);
 * ```
 */
export async function runNessie(
  args: string[] = Deno.args,
  withExit = true,
): Promise<ReturnType<typeof mainCommand.parse>> {
  if (!withExit) {
    return await mainCommand.parse(args);
  }

  try {
    await mainCommand.parse(args);

    Deno.exit();
  } catch (e) {
    if (e instanceof NessieError) {
      console.error(e);
    } else {
      console.error(
        e,
        "\n",
        yellow(
          "This error is most likely unrelated to Nessie, and is probably related to the client, the connection config or the query you are trying to execute.",
        ),
      );
    }
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await runNessie();
}
