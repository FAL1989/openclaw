import { Command } from "commander";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MessageCliHelpers } from "./helpers.js";
import { registerMessageDiscordAdminCommands } from "./register.discord-admin.js";

function createHelpers(runMessageAction: MessageCliHelpers["runMessageAction"]): MessageCliHelpers {
  return {
    withMessageBase: (command) =>
      command
        .option("--channel <channel>", "Channel")
        .option("--account <id>", "Account")
        .option("--json", "JSON", false)
        .option("--dry-run", "Dry run", false)
        .option("--verbose", "Verbose", false),
    withMessageTarget: (command) => command.option("-t, --target <dest>", "Target"),
    withRequiredMessageTarget: (command) => command.requiredOption("-t, --target <dest>", "Target"),
    runMessageAction,
  };
}

describe("registerMessageDiscordAdminCommands", () => {
  const runMessageAction = vi.fn(
    async (_action: string, _opts: Record<string, unknown>) => undefined,
  );

  beforeEach(() => {
    runMessageAction.mockClear();
  });

  it("routes channel create CLI calls to the Discord channel-create action", async () => {
    const message = new Command().exitOverride();
    registerMessageDiscordAdminCommands(message, createHelpers(runMessageAction));

    await message.parseAsync(
      [
        "channel",
        "create",
        "--channel",
        "discord",
        "--guild-id",
        "guild-1",
        "--name",
        "ops",
        "--type",
        "0",
        "--parent-id",
        "cat-1",
        "--topic",
        "Operations",
        "--position",
        "2",
        "--nsfw",
      ],
      { from: "user" },
    );

    expect(runMessageAction).toHaveBeenCalledWith(
      "channel-create",
      expect.objectContaining({
        channel: "discord",
        guildId: "guild-1",
        name: "ops",
        type: "0",
        parentId: "cat-1",
        topic: "Operations",
        position: "2",
        nsfw: true,
      }),
    );
  });
});
