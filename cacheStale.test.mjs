import { deepStrictEqual, strictEqual, throws } from "assert";
import revertableGlobals from "revertable-globals";
import Cache from "./Cache.mjs";
import cacheStale from "./cacheStale.mjs";
import createArgErrorMessageProd from "./createArgErrorMessageProd.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";

export default (tests) => {
  tests.add("`cacheStale` bundle size.", async () => {
    await assertBundleSize(new URL("./cacheStale.mjs", import.meta.url), 450);
  });

  tests.add("`cacheStale` argument 1 `cache` not a `Cache` instance.", () => {
    const cache = true;

    throws(() => {
      cacheStale(cache);
    }, new TypeError("Argument 1 `cache` must be a `Cache` instance."));

    const revertGlobals = revertableGlobals(
      { NODE_ENV: "production" },
      process.env
    );

    try {
      throws(() => {
        cacheStale(cache);
      }, new TypeError(createArgErrorMessageProd(1)));
    } finally {
      revertGlobals();
    }
  });

  tests.add("`cacheStale` argument 2 `cacheKeyMatcher` not a function.", () => {
    const cache = new Cache();
    const cacheKeyMatcher = true;

    throws(() => {
      cacheStale(cache, cacheKeyMatcher);
    }, new TypeError("Argument 2 `cacheKeyMatcher` must be a function."));

    const revertGlobals = revertableGlobals(
      { NODE_ENV: "production" },
      process.env
    );

    try {
      throws(() => {
        cacheStale(cache, cacheKeyMatcher);
      }, new TypeError(createArgErrorMessageProd(2)));
    } finally {
      revertGlobals();
    }
  });

  tests.add("`cacheStale` argument 2 `cacheKeyMatcher` unused.", () => {
    const initialCacheStore = { a: 1, b: 2 };
    const cache = new Cache({ ...initialCacheStore });
    const events = [];
    const listener = (event) => {
      events.push(event);
    };

    cache.addEventListener("a/stale", listener);
    cache.addEventListener("b/stale", listener);

    cacheStale(cache);

    strictEqual(events.length, 2);

    strictEqual(events[0] instanceof CustomEvent, true);
    strictEqual(events[0].type, "a/stale");
    strictEqual(events[0].cancelable, false);

    strictEqual(events[1] instanceof CustomEvent, true);
    strictEqual(events[1].type, "b/stale");
    strictEqual(events[1].cancelable, false);

    deepStrictEqual(cache.store, initialCacheStore);
  });

  tests.add("`cacheStale` argument 2 `cacheKeyMatcher` used.", () => {
    const initialCacheStore = { a: 1, b: 2, c: 3 };
    const cache = new Cache({ ...initialCacheStore });
    const events = [];
    const listener = (event) => {
      events.push(event);
    };

    cache.addEventListener("a/stale", listener);
    cache.addEventListener("b/stale", listener);
    cache.addEventListener("c/stale", listener);

    cacheStale(cache, (cacheKey) => cacheKey !== "b");

    strictEqual(events.length, 2);

    strictEqual(events[0] instanceof CustomEvent, true);
    strictEqual(events[0].type, "a/stale");
    strictEqual(events[0].cancelable, false);

    strictEqual(events[1] instanceof CustomEvent, true);
    strictEqual(events[1].type, "c/stale");
    strictEqual(events[1].cancelable, false);

    deepStrictEqual(cache.store, initialCacheStore);
  });
};
