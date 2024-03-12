// @ts-check

import "./test/polyfillCustomEvent.mjs";

import { deepStrictEqual, strictEqual } from "node:assert";
import { describe, it } from "node:test";

import Loading from "./Loading.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import assertInstanceOf from "./test/assertInstanceOf.mjs";

describe("Class `Loading`.", { concurrency: true }, () => {
  it("Bundle size.", async () => {
    await assertBundleSize(new URL("./Loading.mjs", import.meta.url), 120);
  });

  it("Constructor.", () => {
    const loading = new Loading();

    deepStrictEqual(loading.store, {});
  });

  it("Events.", () => {
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
});
