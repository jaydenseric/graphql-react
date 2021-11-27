import { deepStrictEqual, strictEqual, throws } from 'assert';
import revertableGlobals from 'revertable-globals';
import Cache from './Cache.js';
import cachePrune from './cachePrune.js';
import createArgErrorMessageProd from './createArgErrorMessageProd.js';
import assertBundleSize from './test/assertBundleSize.mjs';

export default (tests) => {
  tests.add('`cachePrune` bundle size.', async () => {
    await assertBundleSize(new URL('./cachePrune.js', import.meta.url), 600);
  });

  tests.add('`cachePrune` argument 1 `cache` not a `Cache` instance.', () => {
    const cache = true;

    throws(() => {
      cachePrune(cache);
    }, new TypeError('Argument 1 `cache` must be a `Cache` instance.'));

    const revertGlobals = revertableGlobals(
      { NODE_ENV: 'production' },
      process.env
    );

    try {
      throws(() => {
        cachePrune(cache);
      }, new TypeError(createArgErrorMessageProd(1)));
    } finally {
      revertGlobals();
    }
  });

  tests.add('`cachePrune` argument 2 `cacheKeyMatcher` not a function.', () => {
    const cache = new Cache();
    const cacheKey = true;

    throws(() => {
      cachePrune(cache, cacheKey);
    }, new TypeError('Argument 2 `cacheKeyMatcher` must be a function.'));

    const revertGlobals = revertableGlobals(
      { NODE_ENV: 'production' },
      process.env
    );

    try {
      throws(() => {
        cachePrune(cache, cacheKey);
      }, new TypeError(createArgErrorMessageProd(2)));
    } finally {
      revertGlobals();
    }
  });

  tests.add('`cachePrune` argument 2 `cacheKeyMatcher` unused.', () => {
    const cache = new Cache({ a: 1, b: 2 });
    const events = [];
    const listener = (event) => {
      events.push(event);
    };

    cache.addEventListener('a/prune', listener);
    cache.addEventListener('a/delete', listener);

    cache.addEventListener('b/prune', listener);
    cache.addEventListener('b/delete', listener);

    cachePrune(cache);

    strictEqual(events.length, 4);

    strictEqual(events[0] instanceof CustomEvent, true);
    strictEqual(events[0].type, 'a/prune');
    strictEqual(events[0].cancelable, true);
    strictEqual(events[0].defaultPrevented, false);

    strictEqual(events[1] instanceof CustomEvent, true);
    strictEqual(events[1].type, 'a/delete');
    strictEqual(events[1].cancelable, false);

    strictEqual(events[2] instanceof CustomEvent, true);
    strictEqual(events[2].type, 'b/prune');
    strictEqual(events[2].cancelable, true);
    strictEqual(events[2].defaultPrevented, false);

    strictEqual(events[3] instanceof CustomEvent, true);
    strictEqual(events[3].type, 'b/delete');
    strictEqual(events[3].cancelable, false);

    deepStrictEqual(cache.store, {});
  });

  tests.add('`cachePrune` argument 2 `cacheKeyMatcher` used.', () => {
    const cache = new Cache({ a: 1, b: 2, c: 3 });
    const events = [];
    const listener = (event) => {
      events.push(event);
    };

    cache.addEventListener('a/prune', listener);
    cache.addEventListener('a/delete', listener);

    cache.addEventListener('b/prune', listener);
    cache.addEventListener('b/delete', listener);

    cache.addEventListener('c/prune', listener);
    cache.addEventListener('c/delete', listener);

    cachePrune(cache, (cacheKey) => cacheKey !== 'b');

    strictEqual(events.length, 4);

    strictEqual(events[0] instanceof CustomEvent, true);
    strictEqual(events[0].type, 'a/prune');
    strictEqual(events[0].cancelable, true);
    strictEqual(events[0].defaultPrevented, false);

    strictEqual(events[1] instanceof CustomEvent, true);
    strictEqual(events[1].type, 'a/delete');
    strictEqual(events[1].cancelable, false);

    strictEqual(events[2] instanceof CustomEvent, true);
    strictEqual(events[2].type, 'c/prune');
    strictEqual(events[2].cancelable, true);
    strictEqual(events[2].defaultPrevented, false);

    strictEqual(events[3] instanceof CustomEvent, true);
    strictEqual(events[3].type, 'c/delete');
    strictEqual(events[3].cancelable, false);

    deepStrictEqual(cache.store, { b: 2 });
  });
};
