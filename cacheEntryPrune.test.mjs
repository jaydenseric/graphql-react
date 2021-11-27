import { deepStrictEqual, strictEqual, throws } from 'assert';
import revertableGlobals from 'revertable-globals';
import Cache from './Cache.js';
import cacheEntryPrune from './cacheEntryPrune.js';
import createArgErrorMessageProd from './createArgErrorMessageProd.js';
import assertBundleSize from './test/assertBundleSize.mjs';

export default (tests) => {
  tests.add('`cacheEntryPrune` bundle size.', async () => {
    await assertBundleSize(
      new URL('./cacheEntryPrune.js', import.meta.url),
      500
    );
  });

  tests.add(
    '`cacheEntryPrune` argument 1 `cache` not a `Cache` instance.',
    () => {
      const cache = true;

      throws(() => {
        cacheEntryPrune(cache);
      }, new TypeError('Argument 1 `cache` must be a `Cache` instance.'));

      const revertGlobals = revertableGlobals(
        { NODE_ENV: 'production' },
        process.env
      );

      try {
        throws(() => {
          cacheEntryPrune(cache);
        }, new TypeError(createArgErrorMessageProd(1)));
      } finally {
        revertGlobals();
      }
    }
  );

  tests.add('`cacheEntryPrune` argument 2 `cacheKey` not a string.', () => {
    const cache = new Cache();
    const cacheKey = true;

    throws(() => {
      cacheEntryPrune(cache, cacheKey);
    }, new TypeError('Argument 2 `cacheKey` must be a string.'));

    const revertGlobals = revertableGlobals(
      { NODE_ENV: 'production' },
      process.env
    );

    try {
      throws(() => {
        cacheEntryPrune(cache, cacheKey);
      }, new TypeError(createArgErrorMessageProd(2)));
    } finally {
      revertGlobals();
    }
  });

  tests.add('`cacheEntryPrune` with entry not populated.', () => {
    const initialCacheStore = { a: 1 };
    const cache = new Cache({ ...initialCacheStore });
    const events = [];
    const listener = (event) => {
      events.push(event);
    };

    cache.addEventListener('b/prune', listener);
    cache.addEventListener('b/delete', listener);

    cacheEntryPrune(cache, 'b');

    deepStrictEqual(events, []);
    deepStrictEqual(cache.store, initialCacheStore);
  });

  tests.add(
    '`cacheEntryPrune` with entry populated, prune event not canceled.',
    () => {
      const pruneCacheKey = 'b';
      const cache = new Cache({ a: 1, [pruneCacheKey]: 2 });
      const events = [];
      const listener = (event) => {
        events.push(event);
      };

      cache.addEventListener(`${pruneCacheKey}/prune`, listener);
      cache.addEventListener(`${pruneCacheKey}/delete`, listener);

      cacheEntryPrune(cache, pruneCacheKey);

      strictEqual(events.length, 2);

      strictEqual(events[0] instanceof CustomEvent, true);
      strictEqual(events[0].type, `${pruneCacheKey}/prune`);
      strictEqual(events[0].cancelable, true);
      strictEqual(events[0].defaultPrevented, false);

      strictEqual(events[1] instanceof CustomEvent, true);
      strictEqual(events[1].type, `${pruneCacheKey}/delete`);
      strictEqual(events[1].cancelable, false);

      deepStrictEqual(cache.store, { a: 1 });
    }
  );

  tests.add(
    '`cacheEntryPrune` with entry populated, prune event canceled.',
    () => {
      const pruneCacheKey = 'b';
      const initialCacheStore = { a: 1, [pruneCacheKey]: 2 };
      const cache = new Cache({ ...initialCacheStore });
      const events = [];

      cache.addEventListener(`${pruneCacheKey}/prune`, (event) => {
        event.preventDefault();
        events.push(event);
      });
      cache.addEventListener(`${pruneCacheKey}/delete`, (event) => {
        events.push(event);
      });

      cacheEntryPrune(cache, pruneCacheKey);

      strictEqual(events.length, 1);

      strictEqual(events[0] instanceof CustomEvent, true);
      strictEqual(events[0].type, `${pruneCacheKey}/prune`);
      strictEqual(events[0].cancelable, true);
      strictEqual(events[0].defaultPrevented, true);

      deepStrictEqual(cache.store, initialCacheStore);
    }
  );
};
