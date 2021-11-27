import { deepStrictEqual, strictEqual, throws } from 'assert';
import revertableGlobals from 'revertable-globals';
import createArgErrorMessageProd from '../../private/createArgErrorMessageProd.js';
import Cache from '../../public/Cache.js';
import cacheEntrySet from '../../public/cacheEntrySet.js';
import assertBundleSize from '../assertBundleSize.mjs';

export default (tests) => {
  tests.add('`cacheEntrySet` bundle size.', async () => {
    await assertBundleSize(
      new URL('../../public/cacheEntrySet.js', import.meta.url),
      500
    );
  });

  tests.add(
    '`cacheEntrySet` argument 1 `cache` not a `Cache` instance.',
    () => {
      const cache = true;

      throws(() => {
        cacheEntrySet(cache);
      }, new TypeError('Argument 1 `cache` must be a `Cache` instance.'));

      const revertGlobals = revertableGlobals(
        { NODE_ENV: 'production' },
        process.env
      );

      try {
        throws(() => {
          cacheEntrySet(cache);
        }, new TypeError(createArgErrorMessageProd(1)));
      } finally {
        revertGlobals();
      }
    }
  );

  tests.add('`cacheEntrySet` argument 2 `cacheKey` not a string.', () => {
    const cache = new Cache();
    const cacheKey = true;

    throws(() => {
      cacheEntrySet(cache, cacheKey);
    }, new TypeError('Argument 2 `cacheKey` must be a string.'));

    const revertGlobals = revertableGlobals(
      { NODE_ENV: 'production' },
      process.env
    );

    try {
      throws(() => {
        cacheEntrySet(cache, cacheKey);
      }, new TypeError(createArgErrorMessageProd(2)));
    } finally {
      revertGlobals();
    }
  });

  tests.add('`cacheEntrySet` sets a cache entry.', () => {
    const initialCacheStore = { a: 1 };
    const cache = new Cache({ ...initialCacheStore });
    const events = [];
    const listener = (event) => {
      events.push(event);
    };
    const setCacheKey = 'b';
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
