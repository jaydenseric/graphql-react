// @ts-check

import "./test/polyfillCustomEvent.mjs";

import { deepStrictEqual, strictEqual, throws } from "node:assert";
import { describe, it } from "node:test";

import Cache from "./Cache.mjs";
import cacheStale from "./cacheStale.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import assertInstanceOf from "./test/assertInstanceOf.mjs";

describe("Function `cacheStale`.", { concurrency: true }, () => {
  it("Bundle size.", async () => {
    await assertBundleSize(new URL("./cacheStale.mjs", import.meta.url), 450);
  });

  it("Argument 1 `cache` not a `Cache` instance.", () => {
    throws(() => {
      cacheStale(
        // @ts-expect-error Testing invalid.
        true
      );
    }, new TypeError("Argument 1 `cache` must be a `Cache` instance."));
  });

  it("Argument 2 `cacheKeyMatcher` not a function.", () => {
    throws(() => {
      cacheStale(
        new Cache(),
        // @ts-expect-error Testing invalid.
        true
      );
    }, new TypeError("Argument 2 `cacheKeyMatcher` must be a function."));
  });

  it("Argument 2 `cacheKeyMatcher` unused.", () => {
    const initialCacheStore = { a: 1, b: 2 };
    const cache = new Cache({ ...initialCacheStore });

    /** @type {Array<Event>} */
    const events = [];

    /** @type {EventListener} */
    const listener = (event) => {
      events.push(event);
    };

    cache.addEventListener("a/stale", listener);
    cache.addEventListener("b/stale", listener);

    cacheStale(cache);

    strictEqual(events.length, 2);

    assertInstanceOf(events[0], CustomEvent);
    strictEqual(events[0].type, "a/stale");
    strictEqual(events[0].cancelable, false);

    assertInstanceOf(events[1], CustomEvent);
    strictEqual(events[1].type, "b/stale");
    strictEqual(events[1].cancelable, false);

    deepStrictEqual(cache.store, initialCacheStore);
  });

  it("Argument 2 `cacheKeyMatcher` used.", () => {
    const initialCacheStore = { a: 1, b: 2, c: 3 };
    const cache = new Cache({ ...initialCacheStore });

    /** @type {Array<Event>} */
    const events = [];

    /** @type {EventListener} */
    const listener = (event) => {
      events.push(event);
    };

    cache.addEventListener("a/stale", listener);
    cache.addEventListener("b/stale", listener);
    cache.addEventListener("c/stale", listener);

    cacheStale(cache, (cacheKey) => cacheKey !== "b");

    strictEqual(events.length, 2);

    assertInstanceOf(events[0], CustomEvent);
    strictEqual(events[0].type, "a/stale");
    strictEqual(events[0].cancelable, false);

    assertInstanceOf(events[1], CustomEvent);
    strictEqual(events[1].type, "c/stale");
    strictEqual(events[1].cancelable, false);

    deepStrictEqual(cache.store, initialCacheStore);
  });
});
