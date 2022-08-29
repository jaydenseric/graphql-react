// @ts-check

import { deepStrictEqual, strictEqual, throws } from "node:assert";

import Cache from "./Cache.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import assertInstanceOf from "./test/assertInstanceOf.mjs";

/**
 * Adds `Cache` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add("`Cache` bundle size.", async () => {
    await assertBundleSize(new URL("./Cache.mjs", import.meta.url), 200);
  });

  tests.add("`Cache` constructor argument 1 `store`, not an object.", () => {
    throws(() => {
      new Cache(
        // @ts-expect-error Testing invalid.
        null
      );
    }, new TypeError("Constructor argument 1 `store` must be an object."));
  });

  tests.add("`Cache` constructor argument 1 `store`, missing", () => {
    const cache = new Cache();

    deepStrictEqual(cache.store, {});
  });

  tests.add("`Cache` constructor argument 1 `store`, object.", () => {
    const initialStore = {
      a: 1,
      b: 2,
    };
    const cache = new Cache({ ...initialStore });

    deepStrictEqual(cache.store, initialStore);
  });

  tests.add("`Cache` events.", () => {
    const cache = new Cache();

    assertInstanceOf(cache, EventTarget);

    /** @type {Event | null} */
    let listenedEvent = null;

    /** @type {EventListener} */
    const listener = (event) => {
      listenedEvent = event;
    };

    const eventName = "a";
    const event = new CustomEvent(eventName);

    cache.addEventListener(eventName, listener);
    cache.dispatchEvent(event);

    strictEqual(listenedEvent, event);

    listenedEvent = null;

    cache.removeEventListener(eventName, listener);
    cache.dispatchEvent(new CustomEvent(eventName));

    strictEqual(listenedEvent, null);
  });
};
