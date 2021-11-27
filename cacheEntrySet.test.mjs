import { deepStrictEqual, strictEqual, throws } from "assert";
import Cache from "./Cache.mjs";
import cacheEntrySet from "./cacheEntrySet.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";

export default (tests) => {
  tests.add("`cacheEntrySet` bundle size.", async () => {
    await assertBundleSize(
      new URL("./cacheEntrySet.mjs", import.meta.url),
      350
    );
  });

  tests.add(
    "`cacheEntrySet` argument 1 `cache` not a `Cache` instance.",
    () => {
      throws(() => {
        cacheEntrySet(true);
      }, new TypeError("Argument 1 `cache` must be a `Cache` instance."));
    }
  );

  tests.add("`cacheEntrySet` argument 2 `cacheKey` not a string.", () => {
    throws(() => {
      cacheEntrySet(new Cache(), true);
    }, new TypeError("Argument 2 `cacheKey` must be a string."));
  });

  tests.add("`cacheEntrySet` sets a cache entry.", () => {
    const initialCacheStore = { a: 1 };
    const cache = new Cache({ ...initialCacheStore });
    const events = [];
    const listener = (event) => {
      events.push(event);
    };
    const setCacheKey = "b";
    const setCacheValue = 2;
    const setEventName = `${setCacheKey}/set`;

    cache.addEventListener(setEventName, listener);

    cacheEntrySet(cache, setCacheKey, setCacheValue);

    strictEqual(events.length, 1);

    strictEqual(events[0] instanceof CustomEvent, true);
    strictEqual(events[0].type, setEventName);
    strictEqual(events[0].cancelable, false);
    deepStrictEqual(events[0].detail, { cacheValue: setCacheValue });

    deepStrictEqual(cache.store, {
      ...initialCacheStore,
      [setCacheKey]: setCacheValue,
    });
  });
};
