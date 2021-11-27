import { deepStrictEqual, strictEqual, throws } from "assert";
import Cache from "./Cache.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";

export default (tests) => {
  tests.add("`Cache` bundle size.", async () => {
    await assertBundleSize(new URL("./Cache.mjs", import.meta.url), 200);
  });

  tests.add("`Cache` constructor argument 1 `store`, not an object.", () => {
    throws(() => {
      new Cache(null);
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

    strictEqual(cache instanceof EventTarget, true);

    let listenedEvent;

    const listener = (event) => {
      listenedEvent = event;
    };

    const eventName = "a";
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
