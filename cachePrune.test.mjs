// @ts-check

import { deepStrictEqual, strictEqual, throws } from "assert";

import Cache from "./Cache.mjs";
import cachePrune from "./cachePrune.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import assertInstanceOf from "./test/assertInstanceOf.mjs";

/**
 * Adds `cachePrune` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add("`cachePrune` bundle size.", async () => {
    await assertBundleSize(new URL("./cachePrune.mjs", import.meta.url), 400);
  });

  tests.add("`cachePrune` argument 1 `cache` not a `Cache` instance.", () => {
    throws(() => {
      cachePrune(
        // @ts-expect-error Testing invalid.
        true
      );
    }, new TypeError("Argument 1 `cache` must be a `Cache` instance."));
  });

  tests.add("`cachePrune` argument 2 `cacheKeyMatcher` not a function.", () => {
    throws(() => {
      cachePrune(
        new Cache(),
        // @ts-expect-error Testing invalid.
        true
      );
    }, new TypeError("Argument 2 `cacheKeyMatcher` must be a function."));
  });

  tests.add("`cachePrune` argument 2 `cacheKeyMatcher` unused.", () => {
    const cache = new Cache({ a: 1, b: 2 });

    /** @type {Array<Event>} */
    const events = [];

    /** @type {EventListener} */
    const listener = (event) => {
      events.push(event);
    };

    cache.addEventListener("a/prune", listener);
    cache.addEventListener("a/delete", listener);

    cache.addEventListener("b/prune", listener);
    cache.addEventListener("b/delete", listener);

    cachePrune(cache);

    strictEqual(events.length, 4);

    assertInstanceOf(events[0], CustomEvent);
    strictEqual(events[0].type, "a/prune");
    strictEqual(events[0].cancelable, true);
    strictEqual(events[0].defaultPrevented, false);

    assertInstanceOf(events[1], CustomEvent);
    strictEqual(events[1].type, "a/delete");
    strictEqual(events[1].cancelable, false);

    assertInstanceOf(events[2], CustomEvent);
    strictEqual(events[2].type, "b/prune");
    strictEqual(events[2].cancelable, true);
    strictEqual(events[2].defaultPrevented, false);

    assertInstanceOf(events[3], CustomEvent);
    strictEqual(events[3].type, "b/delete");
    strictEqual(events[3].cancelable, false);

    deepStrictEqual(cache.store, {});
  });

  tests.add("`cachePrune` argument 2 `cacheKeyMatcher` used.", () => {
    const cache = new Cache({ a: 1, b: 2, c: 3 });

    /** @type {Array<Event>} */
    const events = [];

    /** @type {EventListener} */
    const listener = (event) => {
      events.push(event);
    };

    cache.addEventListener("a/prune", listener);
    cache.addEventListener("a/delete", listener);

    cache.addEventListener("b/prune", listener);
    cache.addEventListener("b/delete", listener);

    cache.addEventListener("c/prune", listener);
    cache.addEventListener("c/delete", listener);

    cachePrune(cache, (cacheKey) => cacheKey !== "b");

    strictEqual(events.length, 4);

    assertInstanceOf(events[0], CustomEvent);
    strictEqual(events[0].type, "a/prune");
    strictEqual(events[0].cancelable, true);
    strictEqual(events[0].defaultPrevented, false);

    assertInstanceOf(events[1], CustomEvent);
    strictEqual(events[1].type, "a/delete");
    strictEqual(events[1].cancelable, false);

    assertInstanceOf(events[2], CustomEvent);
    strictEqual(events[2].type, "c/prune");
    strictEqual(events[2].cancelable, true);
    strictEqual(events[2].defaultPrevented, false);

    assertInstanceOf(events[3], CustomEvent);
    strictEqual(events[3].type, "c/delete");
    strictEqual(events[3].cancelable, false);

    deepStrictEqual(cache.store, { b: 2 });
  });
};
