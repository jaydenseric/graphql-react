import { deepStrictEqual, strictEqual, throws } from 'assert';
import revertableGlobals from 'revertable-globals';
import createArgErrorMessageProd from '../../private/createArgErrorMessageProd.js';
import Cache from '../../public/Cache.js';

export default (tests) => {
  tests.add('`Cache` constructor argument 1 `store`, not an object.', () => {
    const store = null;

    throws(() => {
      new Cache(store);
    }, new TypeError('Constructor argument 1 `store` must be an object.'));

    const revertGlobals = revertableGlobals(
      { NODE_ENV: 'production' },
      process.env
    );

    try {
      throws(() => {
        new Cache(store);
      }, new TypeError(createArgErrorMessageProd(1)));
    } finally {
      revertGlobals();
    }
  });

  tests.add('`Cache` constructor argument 1 `store`, missing', () => {
    const cache = new Cache();

    deepStrictEqual(cache.store, {});
  });

  tests.add('`Cache` constructor argument 1 `store`, object.', () => {
    const initialStore = {
      a: 1,
      b: 2,
    };
    const cache = new Cache({ ...initialStore });

    deepStrictEqual(cache.store, initialStore);
  });

  tests.add('`Cache` events.', () => {
    const cache = new Cache();

    strictEqual(cache instanceof EventTarget, true);

    let listenedEvent;

    const listener = (event) => {
      listenedEvent = event;
    };

    const eventName = 'a';
    const eventDetail = 1;
    const event = new CustomEvent(eventName, {
      detail: eventDetail,
    });

    cache.addEventListener(eventName, listener);
    cache.dispatchEvent(event);

    deepStrictEqual(listenedEvent, event);
    strictEqual(listenedEvent.detail, eventDetail);

    listenedEvent = null;

    cache.removeEventListener(eventName, listener);
    cache.dispatchEvent(new CustomEvent(eventName));

    strictEqual(listenedEvent, null);
  });
};
