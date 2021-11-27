import { deepStrictEqual, strictEqual, throws } from 'assert';
import revertableGlobals from 'revertable-globals';
import Cache from './Cache.mjs';
import Loading from './Loading.mjs';
import LoadingCacheValue from './LoadingCacheValue.mjs';
import createArgErrorMessageProd from './createArgErrorMessageProd.mjs';
import assertBundleSize from './test/assertBundleSize.mjs';

export default (tests) => {
  tests.add('`LoadingCacheValue` bundle size.', async () => {
    await assertBundleSize(
      new URL('./LoadingCacheValue.mjs', import.meta.url),
      850
    );
  });

  tests.add(
    '`LoadingCacheValue` constructor argument 1 `loading` not a `Loading` instance.',
    () => {
      const loading = true;

      throws(() => {
        new LoadingCacheValue(loading);
      }, new TypeError('Argument 1 `loading` must be a `Loading` instance.'));

      const revertGlobals = revertableGlobals(
        { NODE_ENV: 'production' },
        process.env
      );

      try {
        throws(() => {
          new LoadingCacheValue(loading);
        }, new TypeError(createArgErrorMessageProd(1)));
      } finally {
        revertGlobals();
      }
    }
  );

  tests.add(
    '`LoadingCacheValue` constructor argument 2 `cache` not a `Cache` instance.',
    () => {
      const loading = new Loading();
      const cache = true;

      throws(() => {
        new LoadingCacheValue(loading, cache);
      }, new TypeError('Argument 2 `cache` must be a `Cache` instance.'));

      const revertGlobals = revertableGlobals(
        { NODE_ENV: 'production' },
        process.env
      );

      try {
        throws(() => {
          new LoadingCacheValue(loading, cache);
        }, new TypeError(createArgErrorMessageProd(2)));
      } finally {
        revertGlobals();
      }
    }
  );

  tests.add(
    '`LoadingCacheValue` constructor argument 3 `cacheKey` not a string.',
    () => {
      const loading = new Loading();
      const cache = new Cache();
      const cacheKey = true;

      throws(() => {
        new LoadingCacheValue(loading, cache, cacheKey);
      }, new TypeError('Argument 3 `cacheKey` must be a string.'));

      const revertGlobals = revertableGlobals(
        { NODE_ENV: 'production' },
        process.env
      );

      try {
        throws(() => {
          new LoadingCacheValue(loading, cache, cacheKey);
        }, new TypeError(createArgErrorMessageProd(3)));
      } finally {
        revertGlobals();
      }
    }
  );

  tests.add(
    '`LoadingCacheValue` constructor argument 4 `loadingResult` not a `Promise` instance.',
    () => {
      const loading = new Loading();
      const cache = new Cache();
      const cacheKey = 'a';
      const loadingResult = true;

      throws(() => {
        new LoadingCacheValue(loading, cache, cacheKey, loadingResult);
      }, new TypeError('Argument 4 `loadingResult` must be a `Promise` instance.'));

      const revertGlobals = revertableGlobals(
        { NODE_ENV: 'production' },
        process.env
      );

      try {
        throws(() => {
          new LoadingCacheValue(loading, cache, cacheKey, loadingResult);
        }, new TypeError(createArgErrorMessageProd(4)));
      } finally {
        revertGlobals();
      }
    }
  );

  tests.add(
    '`LoadingCacheValue` constructor argument 5 `abortController` not an `AbortController` instance.',
    () => {
      const loading = new Loading();
      const cache = new Cache();
      const cacheKey = 'a';
      const loadingResult = Promise.resolve();
      const abortController = true;

      throws(() => {
        new LoadingCacheValue(
          loading,
          cache,
          cacheKey,
          loadingResult,
          abortController
        );
      }, new TypeError('Argument 5 `abortController` must be an `AbortController` instance.'));

      const revertGlobals = revertableGlobals(
        { NODE_ENV: 'production' },
        process.env
      );

      try {
        throws(() => {
          new LoadingCacheValue(
            loading,
            cache,
            cacheKey,
            loadingResult,
            abortController
          );
        }, new TypeError(createArgErrorMessageProd(5)));
      } finally {
        revertGlobals();
      }
    }
  );

  tests.add('`LoadingCacheValue` construction, single loading.', async () => {
    const cacheKey = 'a';
    const cache = new Cache();
    const loading = new Loading();

    let events = [];

    cache.addEventListener(`${cacheKey}/set`, (event) => {
      events.push({ for: 'cache', event });
    });

    const loadingListener = (event) => {
      events.push({ for: 'loading', event });
    };

    loading.addEventListener(`${cacheKey}/start`, loadingListener);
    loading.addEventListener(`${cacheKey}/end`, loadingListener);

    let loadingResultResolve;

    const loadingResult = new Promise((resolve) => {
      loadingResultResolve = resolve;
    });
    const abortController = new AbortController();
    const loadingCacheValue = new LoadingCacheValue(
      loading,
      cache,
      cacheKey,
      loadingResult,
      abortController
    );

    strictEqual(events.length, 1);

    strictEqual(events[0].for, 'loading');
    strictEqual(events[0].event instanceof CustomEvent, true);
    strictEqual(events[0].event.type, `${cacheKey}/start`);
    strictEqual(events[0].event.cancelable, false);
    deepStrictEqual(events[0].event.detail, { loadingCacheValue });

    deepStrictEqual(loading.store, {
      [cacheKey]: new Set([loadingCacheValue]),
    });
    deepStrictEqual(cache.store, {});

    strictEqual(typeof loadingCacheValue.timeStamp, 'number');
    strictEqual(performance.now() - loadingCacheValue.timeStamp < 50, true);
    strictEqual(loadingCacheValue.abortController, abortController);
    strictEqual(loadingCacheValue.promise instanceof Promise, true);

    events = [];

    const cacheValue = Object.freeze({});

    loadingResultResolve(cacheValue);

    const result = await loadingCacheValue.promise;

    strictEqual(events.length, 2);

    strictEqual(events[0].for, 'cache');
    strictEqual(events[0].event instanceof CustomEvent, true);
    strictEqual(events[0].event.type, `${cacheKey}/set`);
    strictEqual(events[0].event.cancelable, false);
    deepStrictEqual(events[0].event.detail, { cacheValue });

    strictEqual(events[1].for, 'loading');
    strictEqual(events[1].event instanceof CustomEvent, true);
    strictEqual(events[1].event.type, `${cacheKey}/end`);
    strictEqual(events[1].event.cancelable, false);
    deepStrictEqual(events[1].event.detail, { loadingCacheValue });

    deepStrictEqual(loading.store, {});
    deepStrictEqual(cache.store, { [cacheKey]: cacheValue });

    strictEqual(result, cacheValue);
  });

  tests.add(
    '`LoadingCacheValue` construction, multiple loading, first ends first.',
    async () => {
      const cacheKey = 'a';
      const cache = new Cache();
      const loading = new Loading();

      let events = [];

      cache.addEventListener(`${cacheKey}/set`, (event) => {
        events.push({ for: 'cache', event });
      });

      const loadingListener = (event) => {
        events.push({ for: 'loading', event });
      };

      loading.addEventListener(`${cacheKey}/start`, loadingListener);
      loading.addEventListener(`${cacheKey}/end`, loadingListener);

      let firstLoadingResultResolve;

      const firstLoadingResult = new Promise((resolve) => {
        firstLoadingResultResolve = resolve;
      });
      const firstAbortController = new AbortController();
      const firstLoadingCacheValue = new LoadingCacheValue(
        loading,
        cache,
        cacheKey,
        firstLoadingResult,
        firstAbortController
      );

      strictEqual(events.length, 1);

      strictEqual(events[0].for, 'loading');
      strictEqual(events[0].event instanceof CustomEvent, true);
      strictEqual(events[0].event.type, `${cacheKey}/start`);
      strictEqual(events[0].event.cancelable, false);
      deepStrictEqual(events[0].event.detail, {
        loadingCacheValue: firstLoadingCacheValue,
      });

      deepStrictEqual(loading.store, {
        [cacheKey]: new Set([firstLoadingCacheValue]),
      });
      deepStrictEqual(cache.store, {});

      strictEqual(typeof firstLoadingCacheValue.timeStamp, 'number');
      strictEqual(
        performance.now() - firstLoadingCacheValue.timeStamp < 50,
        true
      );
      strictEqual(firstLoadingCacheValue.abortController, firstAbortController);
      strictEqual(firstLoadingCacheValue.promise instanceof Promise, true);

      events = [];

      let secondLoadingResultResolve;

      const secondLoadingResult = new Promise((resolve) => {
        secondLoadingResultResolve = resolve;
      });
      const secondAbortController = new AbortController();
      const secondLoadingCacheValue = new LoadingCacheValue(
        loading,
        cache,
        cacheKey,
        secondLoadingResult,
        secondAbortController
      );

      strictEqual(events.length, 1);

      strictEqual(events[0].for, 'loading');
      strictEqual(events[0].event instanceof CustomEvent, true);
      strictEqual(events[0].event.type, `${cacheKey}/start`);
      strictEqual(events[0].event.cancelable, false);
      deepStrictEqual(events[0].event.detail, {
        loadingCacheValue: secondLoadingCacheValue,
      });

      deepStrictEqual(loading.store, {
        [cacheKey]: new Set([firstLoadingCacheValue, secondLoadingCacheValue]),
      });
      deepStrictEqual(cache.store, {});

      strictEqual(typeof secondLoadingCacheValue.timeStamp, 'number');
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
      strictEqual(secondLoadingCacheValue.promise instanceof Promise, true);

      events = [];

      const firstCacheValue = Object.freeze({});

      firstLoadingResultResolve(firstCacheValue);

      const firstResult = await firstLoadingCacheValue.promise;

      strictEqual(events.length, 2);

      strictEqual(events[0].for, 'cache');
      strictEqual(events[0].event instanceof CustomEvent, true);
      strictEqual(events[0].event.type, `${cacheKey}/set`);
      strictEqual(events[0].event.cancelable, false);
      deepStrictEqual(events[0].event.detail, { cacheValue: firstCacheValue });

      strictEqual(events[1].for, 'loading');
      strictEqual(events[1].event instanceof CustomEvent, true);
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

      strictEqual(events[0].for, 'cache');
      strictEqual(events[0].event instanceof CustomEvent, true);
      strictEqual(events[0].event.type, `${cacheKey}/set`);
      strictEqual(events[0].event.cancelable, false);
      deepStrictEqual(events[0].event.detail, { cacheValue: secondCacheValue });

      strictEqual(events[1].for, 'loading');
      strictEqual(events[1].event instanceof CustomEvent, true);
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
    '`LoadingCacheValue` construction, multiple loading, first ends last.',
    async () => {
      const cacheKey = 'a';
      const cache = new Cache();
      const loading = new Loading();

      let events = [];

      cache.addEventListener(`${cacheKey}/set`, (event) => {
        events.push({ for: 'cache', event });
      });

      const loadingListener = (event) => {
        events.push({ for: 'loading', event });
      };

      loading.addEventListener(`${cacheKey}/start`, loadingListener);
      loading.addEventListener(`${cacheKey}/end`, loadingListener);

      let firstLoadingResultResolve;

      const firstLoadingResult = new Promise((resolve) => {
        firstLoadingResultResolve = resolve;
      });
      const firstAbortController = new AbortController();
      const firstLoadingCacheValue = new LoadingCacheValue(
        loading,
        cache,
        cacheKey,
        firstLoadingResult,
        firstAbortController
      );

      strictEqual(events.length, 1);

      strictEqual(events[0].for, 'loading');
      strictEqual(events[0].event instanceof CustomEvent, true);
      strictEqual(events[0].event.type, `${cacheKey}/start`);
      strictEqual(events[0].event.cancelable, false);
      deepStrictEqual(events[0].event.detail, {
        loadingCacheValue: firstLoadingCacheValue,
      });

      deepStrictEqual(loading.store, {
        [cacheKey]: new Set([firstLoadingCacheValue]),
      });
      deepStrictEqual(cache.store, {});

      strictEqual(typeof firstLoadingCacheValue.timeStamp, 'number');
      strictEqual(
        performance.now() - firstLoadingCacheValue.timeStamp < 50,
        true
      );
      strictEqual(firstLoadingCacheValue.abortController, firstAbortController);
      strictEqual(firstLoadingCacheValue.promise instanceof Promise, true);

      events = [];

      let secondLoadingResultResolve;

      const secondLoadingResult = new Promise((resolve) => {
        secondLoadingResultResolve = resolve;
      });
      const secondAbortController = new AbortController();
      const secondLoadingCacheValue = new LoadingCacheValue(
        loading,
        cache,
        cacheKey,
        secondLoadingResult,
        secondAbortController
      );

      strictEqual(events.length, 1);

      strictEqual(events[0].for, 'loading');
      strictEqual(events[0].event instanceof CustomEvent, true);
      strictEqual(events[0].event.type, `${cacheKey}/start`);
      strictEqual(events[0].event.cancelable, false);
      deepStrictEqual(events[0].event.detail, {
        loadingCacheValue: secondLoadingCacheValue,
      });

      deepStrictEqual(loading.store, {
        [cacheKey]: new Set([firstLoadingCacheValue, secondLoadingCacheValue]),
      });
      deepStrictEqual(cache.store, {});

      strictEqual(typeof secondLoadingCacheValue.timeStamp, 'number');
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
      strictEqual(secondLoadingCacheValue.promise instanceof Promise, true);

      events = [];

      const firstCacheValue = Object.freeze({});
      const secondCacheValue = Object.freeze({});
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

      strictEqual(events[0].for, 'cache');
      strictEqual(events[0].event instanceof CustomEvent, true);
      strictEqual(events[0].event.type, `${cacheKey}/set`);
      strictEqual(events[0].event.cancelable, false);
      deepStrictEqual(events[0].event.detail, { cacheValue: firstCacheValue });

      strictEqual(events[1].for, 'loading');
      strictEqual(events[1].event instanceof CustomEvent, true);
      strictEqual(events[1].event.type, `${cacheKey}/end`);
      strictEqual(events[1].event.cancelable, false);
      deepStrictEqual(events[1].event.detail, {
        loadingCacheValue: firstLoadingCacheValue,
      });

      strictEqual(events[2].for, 'cache');
      strictEqual(events[2].event instanceof CustomEvent, true);
      strictEqual(events[2].event.type, `${cacheKey}/set`);
      strictEqual(events[2].event.cancelable, false);
      deepStrictEqual(events[2].event.detail, { cacheValue: secondCacheValue });

      strictEqual(events[3].for, 'loading');
      strictEqual(events[3].event instanceof CustomEvent, true);
      strictEqual(events[3].event.type, `${cacheKey}/end`);
      strictEqual(events[3].event.cancelable, false);
      deepStrictEqual(events[3].event.detail, {
        loadingCacheValue: secondLoadingCacheValue,
      });
    }
  );

  tests.add('`LoadingCacheValue` construction, aborting loading.', async () => {
    const cacheKey = 'a';
    const cache = new Cache();
    const loading = new Loading();

    let events = [];

    cache.addEventListener(`${cacheKey}/set`, (event) => {
      events.push({ for: 'cache', event });
    });

    const loadingListener = (event) => {
      events.push({ for: 'loading', event });
    };

    loading.addEventListener(`${cacheKey}/start`, loadingListener);
    loading.addEventListener(`${cacheKey}/end`, loadingListener);

    const cacheValue = 'Aborted.';
    const abortController = new AbortController();
    const loadingResult = new Promise((resolve) => {
      abortController.signal.addEventListener(
        'abort',
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

    strictEqual(events[0].for, 'loading');
    strictEqual(events[0].event instanceof CustomEvent, true);
    strictEqual(events[0].event.type, `${cacheKey}/start`);
    strictEqual(events[0].event.cancelable, false);
    deepStrictEqual(events[0].event.detail, { loadingCacheValue });

    deepStrictEqual(loading.store, {
      [cacheKey]: new Set([loadingCacheValue]),
    });
    deepStrictEqual(cache.store, {});

    strictEqual(typeof loadingCacheValue.timeStamp, 'number');
    strictEqual(performance.now() - loadingCacheValue.timeStamp < 50, true);
    strictEqual(loadingCacheValue.abortController, abortController);
    strictEqual(loadingCacheValue.promise instanceof Promise, true);

    events = [];

    abortController.abort();

    const result = await loadingCacheValue.promise;

    strictEqual(events.length, 1);

    strictEqual(events[0].for, 'loading');
    strictEqual(events[0].event instanceof CustomEvent, true);
    strictEqual(events[0].event.type, `${cacheKey}/end`);
    strictEqual(events[0].event.cancelable, false);
    deepStrictEqual(events[0].event.detail, { loadingCacheValue });

    deepStrictEqual(loading.store, {});
    deepStrictEqual(cache.store, {});

    strictEqual(result, cacheValue);
  });
};
