// @ts-check

import "./test/polyfillCustomEvent.mjs";

import { deepStrictEqual, strictEqual, throws } from "node:assert";
import { describe, it } from "node:test";

import Cache from "./Cache.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import assertInstanceOf from "./test/assertInstanceOf.mjs";

describe("Class `Cache`.", { concurrency: true }, () => {
  it("Bundle size.", async () => {
    await assertBundleSize(new URL("./Cache.mjs", import.meta.url), 200);
  });

  it("Constructor argument 1 `store` not an object.", () => {
    throws(() => {
      new Cache(
        // @ts-expect-error Testing invalid.
        null
      );
    }, new TypeError("Constructor argument 1 `store` must be an object."));
  });

  it("Constructor argument 1 `store` missing", () => {
    const cache = new Cache();

    deepStrictEqual(cache.store, {});
  });

  it("Constructor argument 1 `store` an object.", () => {
    const initialStore = {
      a: 1,
      b: 2,
    };
    const cache = new Cache({ ...initialStore });

    deepStrictEqual(cache.store, initialStore);
  });

  it("Events.", () => {
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
});
