// @ts-check

import "./test/polyfillCustomEvent.mjs";

import { deepStrictEqual, strictEqual, throws } from "node:assert";
import { describe, it } from "node:test";

import Cache from "./Cache.mjs";
import cacheEntryPrune from "./cacheEntryPrune.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import assertInstanceOf from "./test/assertInstanceOf.mjs";

describe("Function `cacheEntryPrune`.", { concurrency: true }, () => {
  it("Bundle size.", async () => {
    await assertBundleSize(
      new URL("./cacheEntryPrune.mjs", import.meta.url),
      350,
    );
  });

  it("Argument 1 `cache` not a `Cache` instance.", () => {
    throws(() => {
      cacheEntryPrune(
        // @ts-expect-error Testing invalid.
        true,
        "a",
      );
    }, new TypeError("Argument 1 `cache` must be a `Cache` instance."));
  });

  it("Argument 2 `cacheKey` not a string.", () => {
    throws(() => {
      cacheEntryPrune(
        new Cache(),
        // @ts-expect-error Testing invalid.
        true,
      );
    }, new TypeError("Argument 2 `cacheKey` must be a string."));
  });

  it("Entry not populated.", () => {
    const initialCacheStore = { a: 1 };
    const cache = new Cache({ ...initialCacheStore });

    /** @type {Array<Event>} */
    const events = [];

    /** @type {EventListener} */
    const listener = (event) => {
      events.push(event);
    };

    cache.addEventListener("b/prune", listener);
    cache.addEventListener("b/delete", listener);

    cacheEntryPrune(cache, "b");

    deepStrictEqual(events, []);
    deepStrictEqual(cache.store, initialCacheStore);
  });

  it("Entry populated, prune event not canceled.", () => {
    const pruneCacheKey = "b";
    const cache = new Cache({ a: 1, [pruneCacheKey]: 2 });

    /** @type {Array<Event>} */
    const events = [];

    /** @type {EventListener} */
    const listener = (event) => {
      events.push(event);
    };

    cache.addEventListener(`${pruneCacheKey}/prune`, listener);
    cache.addEventListener(`${pruneCacheKey}/delete`, listener);

    cacheEntryPrune(cache, pruneCacheKey);

    strictEqual(events.length, 2);

    assertInstanceOf(events[0], CustomEvent);
    strictEqual(events[0].type, `${pruneCacheKey}/prune`);
    strictEqual(events[0].cancelable, true);
    strictEqual(events[0].defaultPrevented, false);

    assertInstanceOf(events[1], CustomEvent);
    strictEqual(events[1].type, `${pruneCacheKey}/delete`);
    strictEqual(events[1].cancelable, false);

    deepStrictEqual(cache.store, { a: 1 });
  });

  it("Entry populated, prune event canceled.", () => {
    const pruneCacheKey = "b";
    const initialCacheStore = { a: 1, [pruneCacheKey]: 2 };
    const cache = new Cache({ ...initialCacheStore });

    /** @type {Array<Event>} */
    const events = [];

    cache.addEventListener(`${pruneCacheKey}/prune`, (event) => {
      event.preventDefault();
      events.push(event);
    });
    cache.addEventListener(`${pruneCacheKey}/delete`, (event) => {
      events.push(event);
    });

    cacheEntryPrune(cache, pruneCacheKey);

    strictEqual(events.length, 1);

    assertInstanceOf(events[0], CustomEvent);
    strictEqual(events[0].type, `${pruneCacheKey}/prune`);
    strictEqual(events[0].cancelable, true);
    strictEqual(events[0].defaultPrevented, true);

    deepStrictEqual(cache.store, initialCacheStore);
  });
});
