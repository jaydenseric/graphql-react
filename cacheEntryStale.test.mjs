import { deepStrictEqual, strictEqual, throws } from "assert";
import Cache from "./Cache.mjs";
import cacheEntryStale from "./cacheEntryStale.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";

export default (tests) => {
  tests.add("`cacheEntryStale` bundle size.", async () => {
    await assertBundleSize(
      new URL("./cacheEntryStale.mjs", import.meta.url),
      350
    );
  });

  tests.add(
    "`cacheEntryStale` argument 1 `cache` not a `Cache` instance.",
    () => {
      throws(() => {
        cacheEntryStale(true);
      }, new TypeError("Argument 1 `cache` must be a `Cache` instance."));
    }
  );

  tests.add("`cacheEntryStale` argument 2 `cacheKey` not a string.", () => {
    throws(() => {
      cacheEntryStale(new Cache(), true);
    }, new TypeError("Argument 2 `cacheKey` must be a string."));
  });

  tests.add("`cacheEntryStale` with entry not populated.", () => {
    const cacheKey = "a";

    throws(() => {
      cacheEntryStale(new Cache(), cacheKey);
    }, new Error(`Cache key \`${cacheKey}\` isn’t in the store.`));
  });

  tests.add("`cacheEntryStale` with entry populated.", () => {
    const cacheKey = "a";
    const initialCacheStore = { [cacheKey]: 1 };
    const cache = new Cache({ ...initialCacheStore });
    const events = [];
    const listener = (event) => {
      events.push(event);
    };
    const staleEventName = `${cacheKey}/stale`;

    cache.addEventListener(staleEventName, listener);

    cacheEntryStale(cache, cacheKey);

    strictEqual(events.length, 1);

    strictEqual(events[0] instanceof CustomEvent, true);
    strictEqual(events[0].type, staleEventName);
    strictEqual(events[0].cancelable, false);

    deepStrictEqual(cache.store, initialCacheStore);
  });
};
