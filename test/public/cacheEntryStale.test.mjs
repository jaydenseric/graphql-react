import { deepStrictEqual, strictEqual, throws } from 'assert';
import revertableGlobals from 'revertable-globals';
import createArgErrorMessageProd from '../../private/createArgErrorMessageProd.js';
import Cache from '../../public/Cache.js';
import cacheEntryStale from '../../public/cacheEntryStale.js';
import assertBundleSize from '../assertBundleSize.mjs';

export default (tests) => {
  tests.add('`cacheEntryStale` bundle size.', async () => {
    await assertBundleSize(
      new URL('../../public/cacheEntryStale.js', import.meta.url),
      500
    );
  });

  tests.add(
    '`cacheEntryStale` argument 1 `cache` not a `Cache` instance.',
    () => {
      const cache = true;

      throws(() => {
        cacheEntryStale(cache);
      }, new TypeError('Argument 1 `cache` must be a `Cache` instance.'));

      const revertGlobals = revertableGlobals(
        { NODE_ENV: 'production' },
        process.env
      );

      try {
        throws(() => {
          cacheEntryStale(cache);
        }, new TypeError(createArgErrorMessageProd(1)));
      } finally {
        revertGlobals();
      }
    }
  );

  tests.add('`cacheEntryStale` argument 2 `cacheKey` not a string.', () => {
    const cache = new Cache();
    const cacheKey = true;

    throws(() => {
      cacheEntryStale(cache, cacheKey);
    }, new TypeError('Argument 2 `cacheKey` must be a string.'));

    const revertGlobals = revertableGlobals(
      { NODE_ENV: 'production' },
      process.env
    );

    try {
      throws(() => {
        cacheEntryStale(cache, cacheKey);
      }, new TypeError(createArgErrorMessageProd(2)));
    } finally {
      revertGlobals();
    }
  });

  tests.add('`cacheEntryStale` with entry not populated.', () => {
    const cacheKey = 'a';

    throws(() => {
      cacheEntryStale(new Cache(), cacheKey);
    }, new Error(`Cache key \`${cacheKey}\` isn’t in the store.`));
  });

  tests.add('`cacheEntryStale` with entry populated.', () => {
    const cacheKey = 'a';
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
