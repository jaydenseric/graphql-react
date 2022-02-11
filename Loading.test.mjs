// @ts-check

import { deepStrictEqual, strictEqual } from "assert";

import Loading from "./Loading.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import assertInstanceOf from "./test/assertInstanceOf.mjs";

/**
 * Adds `Loading` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add("`Loading` bundle size.", async () => {
    await assertBundleSize(new URL("./Loading.mjs", import.meta.url), 120);
  });

  tests.add("`Loading` constructor.", () => {
    const loading = new Loading();

    deepStrictEqual(loading.store, {});
  });

  tests.add("`Loading` events.", () => {
    const loading = new Loading();

    assertInstanceOf(loading, EventTarget);

    /** @type {Event | null} */
    let listenedEvent = null;

    /** @type {EventListener} */
    const listener = (event) => {
      listenedEvent = event;
    };

    const eventName = "a";
    const event = new CustomEvent(eventName);

    loading.addEventListener(eventName, listener);
    loading.dispatchEvent(event);

    strictEqual(listenedEvent, event);

    listenedEvent = null;

    loading.removeEventListener(eventName, listener);
    loading.dispatchEvent(new CustomEvent(eventName));

    strictEqual(listenedEvent, null);
  });
};
