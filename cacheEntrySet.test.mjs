// @ts-check

import "./test/polyfillCustomEvent.mjs";

import { deepStrictEqual, strictEqual, throws } from "node:assert";
import { describe, it } from "node:test";

import Cache from "./Cache.mjs";
import cacheEntrySet from "./cacheEntrySet.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import assertInstanceOf from "./test/assertInstanceOf.mjs";

describe("Function `cacheEntrySet`.", { concurrency: true }, () => {
  it("Bundle size.", async () => {
    await assertBundleSize(
      new URL("./cacheEntrySet.mjs", import.meta.url),
      350,
    );
  });

  it("Argument 1 `cache` not a `Cache` instance.", () => {
    throws(() => {
      cacheEntrySet(
        // @ts-expect-error Testing invalid.
        true,
        "a",
        {},
      );
    }, new TypeError("Argument 1 `cache` must be a `Cache` instance."));
  });

  it("Argument 2 `cacheKey` not a string.", () => {
    throws(() => {
      cacheEntrySet(
        new Cache(),
        // @ts-expect-error Testing invalid.
        true,
        {},
      );
    }, new TypeError("Argument 2 `cacheKey` must be a string."));
  });

  it("Sets a cache entry.", () => {
    const initialCacheStore = { a: 1 };
    const cache = new Cache({ ...initialCacheStore });

    /** @type {Array<Event>} */
    const events = [];

    const setCacheKey = "b";
    const setCacheValue = 2;
    const setEventName = `${setCacheKey}/set`;

    cache.addEventListener(setEventName, (event) => {
      events.push(event);
    });

    cacheEntrySet(cache, setCacheKey, setCacheValue);

    strictEqual(events.length, 1);

    assertInstanceOf(events[0], CustomEvent);
    strictEqual(events[0].type, setEventName);
    strictEqual(events[0].cancelable, false);
    deepStrictEqual(events[0].detail, { cacheValue: setCacheValue });

    deepStrictEqual(cache.store, {
      ...initialCacheStore,
      [setCacheKey]: setCacheValue,
    });
  });
});
