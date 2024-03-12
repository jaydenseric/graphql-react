// @ts-check

import "./test/polyfillCustomEvent.mjs";

import { deepStrictEqual, strictEqual, throws } from "node:assert";
import { describe, it } from "node:test";

import Cache from "./Cache.mjs";
import cacheEntryStale from "./cacheEntryStale.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import assertInstanceOf from "./test/assertInstanceOf.mjs";

describe("Function `cacheEntryStale`.", { concurrency: true }, () => {
  it("Bundle size.", async () => {
    await assertBundleSize(
      new URL("./cacheEntryStale.mjs", import.meta.url),
      350,
    );
  });

  it("Argument 1 `cache` not a `Cache` instance.", () => {
    throws(() => {
      cacheEntryStale(
        // @ts-expect-error Testing invalid.
        true,
        "a",
      );
    }, new TypeError("Argument 1 `cache` must be a `Cache` instance."));
  });

  it("Argument 2 `cacheKey` not a string.", () => {
    throws(() => {
      cacheEntryStale(
        new Cache(),
        // @ts-expect-error Testing invalid.
        true,
      );
    }, new TypeError("Argument 2 `cacheKey` must be a string."));
  });

  it("Entry not populated.", () => {
    const cacheKey = "a";

    throws(
      () => {
        cacheEntryStale(new Cache(), cacheKey);
      },
      new Error(`Cache key \`${cacheKey}\` isn’t in the store.`),
    );
  });

  it("Entry populated.", () => {
    const cacheKey = "a";
    const initialCacheStore = { [cacheKey]: 1 };
    const cache = new Cache({ ...initialCacheStore });

    /** @type {Array<Event>} */
    const events = [];

    const staleEventName = `${cacheKey}/stale`;

    cache.addEventListener(staleEventName, (event) => {
      events.push(event);
    });

    cacheEntryStale(cache, cacheKey);

    strictEqual(events.length, 1);

    assertInstanceOf(events[0], CustomEvent);
    strictEqual(events[0].type, staleEventName);
    strictEqual(events[0].cancelable, false);

    deepStrictEqual(cache.store, initialCacheStore);
  });
});
