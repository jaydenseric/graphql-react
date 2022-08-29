// @ts-check

import { deepStrictEqual, strictEqual, throws } from "node:assert";

import Cache from "./Cache.mjs";
import Loading from "./Loading.mjs";
import LoadingCacheValue from "./LoadingCacheValue.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import assertInstanceOf from "./test/assertInstanceOf.mjs";
import assertTypeOf from "./test/assertTypeOf.mjs";
import Deferred from "./test/Deferred.mjs";

/**
 * Adds `LoadingCacheValue` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add("`LoadingCacheValue` bundle size.", async () => {
    await assertBundleSize(
      new URL("./LoadingCacheValue.mjs", import.meta.url),
      650
    );
  });

  tests.add(
    "`LoadingCacheValue` constructor argument 1 `loading` not a `Loading` instance.",
    () => {
      throws(() => {
        new LoadingCacheValue(
          // @ts-expect-error Testing invalid.
          true,
          new Cache(),
          "a",
          Promise.resolve(),
          new AbortController()
        );
      }, new TypeError("Argument 1 `loading` must be a `Loading` instance."));
    }
  );

  tests.add(
    "`LoadingCacheValue` constructor argument 2 `cache` not a `Cache` instance.",
    () => {
      throws(() => {
        new LoadingCacheValue(
          new Loading(),
          // @ts-expect-error Testing invalid.
          true,
          "a",
          Promise.resolve(),
          new AbortController()
        );
      }, new TypeError("Argument 2 `cache` must be a `Cache` instance."));
    }
  );

  tests.add(
    "`LoadingCacheValue` constructor argument 3 `cacheKey` not a string.",
    () => {
      throws(() => {
        new LoadingCacheValue(
          new Loading(),
          new Cache(),
          // @ts-expect-error Testing invalid.
          true,
          Promise.resolve(),
          new AbortController()
        );
      }, new TypeError("Argument 3 `cacheKey` must be a string."));
    }
  );

  tests.add(
    "`LoadingCacheValue` constructor argument 4 `loadingResult` not a `Promise` instance.",
    () => {
      throws(() => {
        new LoadingCacheValue(
          new Loading(),
          new Cache(),
          "a",
          // @ts-expect-error Testing invalid.
          true,
          new AbortController()
        );
      }, new TypeError("Argument 4 `loadingResult` must be a `Promise` instance."));
    }
  );

  tests.add(
    "`LoadingCacheValue` constructor argument 5 `abortController` not an `AbortController` instance.",
    () => {
      throws(() => {
        new LoadingCacheValue(
          new Loading(),
          new Cache(),
          "a",
          Promise.resolve(),
          // @ts-expect-error Testing invalid.
          true
        );
      }, new TypeError("Argument 5 `abortController` must be an `AbortController` instance."));
    }
  );

  tests.add("`LoadingCacheValue` construction, single loading.", async () => {
    const cacheKey = "a";
    const cache = new Cache();
    const loading = new Loading();

    /** @type {Array<{ for: "cache" | "loading", event: Event }>} */
    let events = [];

    cache.addEventListener(`${cacheKey}/set`, (event) => {
      events.push({ for: "cache", event });
    });

    /** @type {EventListener} */
    const loadingListener = (event) => {
      events.push({ for: "loading", event });
    };

    loading.addEventListener(`${cacheKey}/start`, loadingListener);
    loading.addEventListener(`${cacheKey}/end`, loadingListener);

    const { promise: loadingResult, resolve: loadingResultResolve } =
      /** @type {Deferred<Readonly<{ [key: string]: unknown }>>} */
      (new Deferred());
    const abortController = new AbortController();
    const loadingCacheValue = new LoadingCacheValue(
      loading,
      cache,
      cacheKey,
      loadingResult,
      abortController
    );

    strictEqual(events.length, 1);

    strictEqual(events[0].for, "loading");
    assertInstanceOf(events[0].event, CustomEvent);
    strictEqual(events[0].event.type, `${cacheKey}/start`);
    strictEqual(events[0].event.cancelable, false);
    deepStrictEqual(events[0].event.detail, { loadingCacheValue });

    deepStrictEqual(loading.store, {
      [cacheKey]: new Set([loadingCacheValue]),
    });
    deepStrictEqual(cache.store, {});

    assertTypeOf(loadingCacheValue.timeStamp, "number");
    strictEqual(performance.now() - loadingCacheValue.timeStamp < 50, true);
    strictEqual(loadingCacheValue.abortController, abortController);
    assertInstanceOf(loadingCacheValue.promise, Promise);

    events = [];

    const cacheValue = Object.freeze({});

    loadingResultResolve(cacheValue);

    const result = await loadingCacheValue.promise;

    strictEqual(events.length, 2);

    strictEqual(events[0].for, "cache");
    assertInstanceOf(events[0].event, CustomEvent);
    strictEqual(events[0].event.type, `${cacheKey}/set`);
    strictEqual(events[0].event.cancelable, false);
    deepStrictEqual(events[0].event.detail, { cacheValue });

    strictEqual(events[1].for, "loading");
    assertInstanceOf(events[1].event, CustomEvent);
    strictEqual(events[1].event.type, `${cacheKey}/end`);
    strictEqual(events[1].event.cancelable, false);
    deepStrictEqual(events[1].event.detail, { loadingCacheValue });

    deepStrictEqual(loading.store, {});
    deepStrictEqual(cache.store, { [cacheKey]: cacheValue });

    strictEqual(result, cacheValue);
  });

  tests.add(
    "`LoadingCacheValue` construction, multiple loading, first ends first.",
    async () => {
      const cacheKey = "a";
      const cache = new Cache();
      const loading = new Loading();

      /** @type {Array<{ for: "cache" | "loading", event: Event }>} */
      let events = [];

      cache.addEventListener(`${cacheKey}/set`, (event) => {
        events.push({ for: "cache", event });
      });

      /** @type {EventListener} */
      const loadingListener = (event) => {
        events.push({ for: "loading", event });
      };

      loading.addEventListener(`${cacheKey}/start`, loadingListener);
      loading.addEventListener(`${cacheKey}/end`, loadingListener);

      const {
        promise: firstLoadingResult,
        resolve: firstLoadingResultResolve,
      } =
        /** @type {Deferred<Readonly<{ [key: string]: unknown }>>} */
        (new Deferred());
      const firstAbortController = new AbortController();
      const firstLoadingCacheValue = new LoadingCacheValue(
        loading,
        cache,
        cacheKey,
        firstLoadingResult,
        firstAbortController
      );

      strictEqual(events.length, 1);

      strictEqual(events[0].for, "loading");
      assertInstanceOf(events[0].event, CustomEvent);
      strictEqual(events[0].event.type, `${cacheKey}/start`);
      strictEqual(events[0].event.cancelable, false);
      deepStrictEqual(events[0].event.detail, {
        loadingCacheValue: firstLoadingCacheValue,
      });

      deepStrictEqual(loading.store, {
        [cacheKey]: new Set([firstLoadingCacheValue]),
      });
      deepStrictEqual(cache.store, {});

      assertTypeOf(firstLoadingCacheValue.timeStamp, "number");
      strictEqual(
        performance.now() - firstLoadingCacheValue.timeStamp < 50,
        true
      );
      strictEqual(firstLoadingCacheValue.abortController, firstAbortController);
      assertInstanceOf(firstLoadingCacheValue.promise, Promise);

      events = [];

      const {
        promise: secondLoadingResult,
        resolve: secondLoadingResultResolve,
      } =
        /** @type {Deferred<Readonly<{ [key: string]: unknown }>>} */
        (new Deferred());
      const secondAbortController = new AbortController();
      const secondLoadingCacheValue = new LoadingCacheValue(
        loading,
        cache,
        cacheKey,
        secondLoadingResult,
        secondAbortController
      );

      strictEqual(events.length, 1);

      strictEqual(events[0].for, "loading");
      assertInstanceOf(events[0].event, CustomEvent);
      strictEqual(events[0].event.type, `${cacheKey}/start`);
      strictEqual(events[0].event.cancelable, false);
      deepStrictEqual(events[0].event.detail, {
        loadingCacheValue: secondLoadingCacheValue,
      });

      deepStrictEqual(loading.store, {
        [cacheKey]: new Set([firstLoadingCacheValue, secondLoadingCacheValue]),
      });
      deepStrictEqual(cache.store, {});

      assertTypeOf(secondLoadingCacheValue.timeStamp, "number");
      strictEqual(
        performance.now() - secondLoadingCacheValue.timeStamp < 50,
        true
      );
      strictEqual(
        secondLoadingCacheValue.timeStamp >= firstLoadingCacheValue.timeStamp,
        true
      );
      strictEqual(
        secondLoadingCacheValue.abortController,
        secondAbortController
      );
      assertInstanceOf(secondLoadingCacheValue.promise, Promise);

      events = [];

      const firstCacheValue = Object.freeze({});

      firstLoadingResultResolve(firstCacheValue);

      const firstResult = await firstLoadingCacheValue.promise;

      strictEqual(events.length, 2);

      strictEqual(events[0].for, "cache");
      assertInstanceOf(events[0].event, CustomEvent);
      strictEqual(events[0].event.type, `${cacheKey}/set`);
      strictEqual(events[0].event.cancelable, false);
      deepStrictEqual(events[0].event.detail, { cacheValue: firstCacheValue });

      strictEqual(events[1].for, "loading");
      assertInstanceOf(events[1].event, CustomEvent);
      strictEqual(events[1].event.type, `${cacheKey}/end`);
      strictEqual(events[1].event.cancelable, false);
      deepStrictEqual(events[1].event.detail, {
        loadingCacheValue: firstLoadingCacheValue,
      });

      deepStrictEqual(loading.store, {
        [cacheKey]: new Set([secondLoadingCacheValue]),
      });
      deepStrictEqual(cache.store, { [cacheKey]: firstCacheValue });

      strictEqual(firstResult, firstCacheValue);

      events = [];

      const secondCacheValue = Object.freeze({});

      secondLoadingResultResolve(secondCacheValue);

      const secondResult = await secondLoadingCacheValue.promise;

      strictEqual(events.length, 2);

      strictEqual(events[0].for, "cache");
      assertInstanceOf(events[0].event, CustomEvent);
      strictEqual(events[0].event.type, `${cacheKey}/set`);
      strictEqual(events[0].event.cancelable, false);
      deepStrictEqual(events[0].event.detail, { cacheValue: secondCacheValue });

      strictEqual(events[1].for, "loading");
      assertInstanceOf(events[1].event, CustomEvent);
      strictEqual(events[1].event.type, `${cacheKey}/end`);
      strictEqual(events[1].event.cancelable, false);
      deepStrictEqual(events[1].event.detail, {
        loadingCacheValue: secondLoadingCacheValue,
      });

      deepStrictEqual(loading.store, {});
      deepStrictEqual(cache.store, { [cacheKey]: secondCacheValue });

      strictEqual(secondResult, secondCacheValue);
    }
  );

  tests.add(
    "`LoadingCacheValue` construction, multiple loading, first ends last.",
    async () => {
      const cacheKey = "a";
      const cache = new Cache();
      const loading = new Loading();

      /** @type {Array<{ for: "cache" | "loading", event: Event }>} */
      let events = [];

      cache.addEventListener(`${cacheKey}/set`, (event) => {
        events.push({ for: "cache", event });
      });

      /** @type {EventListener} */
      const loadingListener = (event) => {
        events.push({ for: "loading", event });
      };

      loading.addEventListener(`${cacheKey}/start`, loadingListener);
      loading.addEventListener(`${cacheKey}/end`, loadingListener);

      const {
        promise: firstLoadingResult,
        resolve: firstLoadingResultResolve,
      } =
        /** @type {Deferred<Readonly<{ [key: string]: unknown }>>} */
        (new Deferred());
      const firstAbortController = new AbortController();
      const firstLoadingCacheValue = new LoadingCacheValue(
        loading,
        cache,
        cacheKey,
        firstLoadingResult,
        firstAbortController
      );

      strictEqual(events.length, 1);

      strictEqual(events[0].for, "loading");
      assertInstanceOf(events[0].event, CustomEvent);
      strictEqual(events[0].event.type, `${cacheKey}/start`);
      strictEqual(events[0].event.cancelable, false);
      deepStrictEqual(events[0].event.detail, {
        loadingCacheValue: firstLoadingCacheValue,
      });

      deepStrictEqual(loading.store, {
        [cacheKey]: new Set([firstLoadingCacheValue]),
      });
      deepStrictEqual(cache.store, {});

      assertTypeOf(firstLoadingCacheValue.timeStamp, "number");
      strictEqual(
        performance.now() - firstLoadingCacheValue.timeStamp < 50,
        true
      );
      strictEqual(firstLoadingCacheValue.abortController, firstAbortController);
      assertInstanceOf(firstLoadingCacheValue.promise, Promise);

      events = [];

      const {
        promise: secondLoadingResult,
        resolve: secondLoadingResultResolve,
      } =
        /** @type {Deferred<Readonly<{ [key: string]: unknown }>>} */
        (new Deferred());
      const secondAbortController = new AbortController();
      const secondLoadingCacheValue = new LoadingCacheValue(
        loading,
        cache,
        cacheKey,
        secondLoadingResult,
        secondAbortController
      );

      strictEqual(events.length, 1);

      strictEqual(events[0].for, "loading");
      assertInstanceOf(events[0].event, CustomEvent);
      strictEqual(events[0].event.type, `${cacheKey}/start`);
      strictEqual(events[0].event.cancelable, false);
      deepStrictEqual(events[0].event.detail, {
        loadingCacheValue: secondLoadingCacheValue,
      });

      deepStrictEqual(loading.store, {
        [cacheKey]: new Set([firstLoadingCacheValue, secondLoadingCacheValue]),
      });
      deepStrictEqual(cache.store, {});

      assertTypeOf(secondLoadingCacheValue.timeStamp, "number");
      strictEqual(
        performance.now() - secondLoadingCacheValue.timeStamp < 50,
        true
      );
      strictEqual(
        secondLoadingCacheValue.timeStamp >= firstLoadingCacheValue.timeStamp,
        true
      );
      strictEqual(
        secondLoadingCacheValue.abortController,
        secondAbortController
      );
      assertInstanceOf(secondLoadingCacheValue.promise, Promise);

      events = [];

      const firstCacheValue = Object.freeze({});
      const secondCacheValue = Object.freeze({});

      /** @type {Array<number>} */
      const loadingResolveOrder = [];

      const firstLoadingCheck = firstLoadingCacheValue.promise.then(
        (firstResult) => {
          loadingResolveOrder.push(1);

          deepStrictEqual(loading.store, {
            [cacheKey]: new Set([secondLoadingCacheValue]),
          });
          deepStrictEqual(cache.store, { [cacheKey]: firstCacheValue });
          strictEqual(firstResult, firstCacheValue);
        }
      );

      const secondLoadingCheck = secondLoadingCacheValue.promise.then(
        (secondResult) => {
          loadingResolveOrder.push(2);

          deepStrictEqual(loading.store, {});
          deepStrictEqual(cache.store, { [cacheKey]: secondCacheValue });
          strictEqual(secondResult, secondCacheValue);
        }
      );

      secondLoadingResultResolve(secondCacheValue);
      firstLoadingResultResolve(firstCacheValue);

      await Promise.all([firstLoadingCheck, secondLoadingCheck]);

      deepStrictEqual(loadingResolveOrder, [1, 2]);

      strictEqual(events.length, 4);

      strictEqual(events[0].for, "cache");
      assertInstanceOf(events[0].event, CustomEvent);
      strictEqual(events[0].event.type, `${cacheKey}/set`);
      strictEqual(events[0].event.cancelable, false);
      deepStrictEqual(events[0].event.detail, { cacheValue: firstCacheValue });

      strictEqual(events[1].for, "loading");
      assertInstanceOf(events[1].event, CustomEvent);
      strictEqual(events[1].event.type, `${cacheKey}/end`);
      strictEqual(events[1].event.cancelable, false);
      deepStrictEqual(events[1].event.detail, {
        loadingCacheValue: firstLoadingCacheValue,
      });

      strictEqual(events[2].for, "cache");
      assertInstanceOf(events[2].event, CustomEvent);
      strictEqual(events[2].event.type, `${cacheKey}/set`);
      strictEqual(events[2].event.cancelable, false);
      deepStrictEqual(events[2].event.detail, { cacheValue: secondCacheValue });

      strictEqual(events[3].for, "loading");
      assertInstanceOf(events[3].event, CustomEvent);
      strictEqual(events[3].event.type, `${cacheKey}/end`);
      strictEqual(events[3].event.cancelable, false);
      deepStrictEqual(events[3].event.detail, {
        loadingCacheValue: secondLoadingCacheValue,
      });
    }
  );

  tests.add("`LoadingCacheValue` construction, aborting loading.", async () => {
    const cacheKey = "a";
    const cache = new Cache();
    const loading = new Loading();

    /** @type {Array<{ for: "cache" | "loading", event: Event }>} */
    let events = [];

    cache.addEventListener(`${cacheKey}/set`, (event) => {
      events.push({ for: "cache", event });
    });

    /** @type {EventListener} */
    const loadingListener = (event) => {
      events.push({ for: "loading", event });
    };

    loading.addEventListener(`${cacheKey}/start`, loadingListener);
    loading.addEventListener(`${cacheKey}/end`, loadingListener);

    const cacheValue = "Aborted.";
    const abortController = new AbortController();
    const loadingResult = new Promise((resolve) => {
      abortController.signal.addEventListener(
        "abort",
        () => {
          resolve(cacheValue);
        },
        { once: true }
      );
    });

    const loadingCacheValue = new LoadingCacheValue(
      loading,
      cache,
      cacheKey,
      loadingResult,
      abortController
    );

    strictEqual(events.length, 1);

    strictEqual(events[0].for, "loading");
    assertInstanceOf(events[0].event, CustomEvent);
    strictEqual(events[0].event.type, `${cacheKey}/start`);
    strictEqual(events[0].event.cancelable, false);
    deepStrictEqual(events[0].event.detail, { loadingCacheValue });

    deepStrictEqual(loading.store, {
      [cacheKey]: new Set([loadingCacheValue]),
    });
    deepStrictEqual(cache.store, {});

    assertTypeOf(loadingCacheValue.timeStamp, "number");
    strictEqual(performance.now() - loadingCacheValue.timeStamp < 50, true);
    strictEqual(loadingCacheValue.abortController, abortController);
    assertInstanceOf(loadingCacheValue.promise, Promise);

    events = [];

    abortController.abort();

    const result = await loadingCacheValue.promise;

    strictEqual(events.length, 1);

    strictEqual(events[0].for, "loading");
    assertInstanceOf(events[0].event, CustomEvent);
    strictEqual(events[0].event.type, `${cacheKey}/end`);
    strictEqual(events[0].event.cancelable, false);
    deepStrictEqual(events[0].event.detail, { loadingCacheValue });

    deepStrictEqual(loading.store, {});
    deepStrictEqual(cache.store, {});

    strictEqual(result, cacheValue);
  });
};
