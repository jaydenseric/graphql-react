'use strict';

const { deepStrictEqual, strictEqual, throws } = require('assert');
const revertableGlobals = require('revertable-globals');
const createArgErrorMessageProd = require('../../private/createArgErrorMessageProd');
const Cache = require('../../public/Cache');
const cacheEntryStale = require('../../public/cacheEntryStale');

module.exports = (tests) => {
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
