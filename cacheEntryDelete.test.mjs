// @ts-check

import { deepStrictEqual, strictEqual, throws } from "node:assert";

import Cache from "./Cache.mjs";
import cacheEntryDelete from "./cacheEntryDelete.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import assertInstanceOf from "./test/assertInstanceOf.mjs";

/**
 * Adds `cacheEntryDelete` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add("`cacheEntryDelete` bundle size.", async () => {
    await assertBundleSize(
      new URL("./cacheEntryDelete.mjs", import.meta.url),
      350
    );
  });

  tests.add(
    "`cacheEntryDelete` argument 1 `cache` not a `Cache` instance.",
    () => {
      throws(() => {
        cacheEntryDelete(
          // @ts-expect-error Testing invalid.
          true,
          "a"
        );
      }, new TypeError("Argument 1 `cache` must be a `Cache` instance."));
    }
  );

  tests.add("`cacheEntryDelete` argument 2 `cacheKey` not a string.", () => {
    throws(() => {
      cacheEntryDelete(
        new Cache(),
        // @ts-expect-error Testing invalid.
        true
      );
    }, new TypeError("Argument 2 `cacheKey` must be a string."));
  });

  tests.add("`cacheEntryDelete` with entry not populated.", () => {
    const cache = new Cache({ a: 1 });

    /** @type {Array<Event>} */
    const events = [];

    cache.addEventListener("b/delete", (event) => {
      events.push(event);
    });

    cacheEntryDelete(cache, "b");

    deepStrictEqual(events, []);
    deepStrictEqual(cache.store, { a: 1 });
  });

  tests.add("`cacheEntryDelete` with entry populated.", () => {
    const deleteCacheKey = "b";
    const cache = new Cache({ a: 1, [deleteCacheKey]: 2 });

    /** @type {Array<Event>} */
    const events = [];

    cache.addEventListener(`${deleteCacheKey}/delete`, (event) => {
      events.push(event);
    });

    cacheEntryDelete(cache, deleteCacheKey);

    strictEqual(events.length, 1);

    assertInstanceOf(events[0], CustomEvent);
    strictEqual(events[0].type, `${deleteCacheKey}/delete`);
    strictEqual(events[0].cancelable, false);

    deepStrictEqual(cache.store, { a: 1 });
  });
};
