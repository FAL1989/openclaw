import { describe, expect, it, vi } from "vitest";
import { deployDiscordCommands } from "./provider.deploy.js";

function createRestMock() {
  return {
    get: vi.fn(async () => undefined),
    post: vi.fn(async () => undefined),
    put: vi.fn(async () => undefined),
    patch: vi.fn(async () => undefined),
    delete: vi.fn(async () => undefined),
  };
}

function createRuntimeMock() {
  return {
    log: vi.fn(),
    error: vi.fn(),
  };
}

function createDeferred() {
  let resolve: () => void = () => {};
  const promise = new Promise<void>((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

describe("deployDiscordCommands", () => {
  it("serializes native command deploys across Discord accounts", async () => {
    const firstStarted = createDeferred();
    const releaseFirst = createDeferred();
    let secondStarted = false;

    const first = deployDiscordCommands({
      client: {
        rest: createRestMock(),
        deployCommands: vi.fn(async () => {
          firstStarted.resolve();
          await releaseFirst.promise;
        }),
      } as never,
      runtime: createRuntimeMock() as never,
      enabled: true,
      accountId: "default",
      shouldLogVerbose: () => false,
    });
    const second = deployDiscordCommands({
      client: {
        rest: createRestMock(),
        deployCommands: vi.fn(async () => {
          secondStarted = true;
        }),
      } as never,
      runtime: createRuntimeMock() as never,
      enabled: true,
      accountId: "falai-cmo",
      shouldLogVerbose: () => false,
    });

    await firstStarted.promise;
    await Promise.resolve();

    expect(secondStarted).toBe(false);

    releaseFirst.resolve();
    await Promise.all([first, second]);

    expect(secondStarted).toBe(true);
  });
});
