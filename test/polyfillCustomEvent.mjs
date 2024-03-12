// @ts-check

// TODO: Delete this polyfill once all supported Node.js versions have the
// global `CustomEvent`:
// https://nodejs.org/api/globals.html#customevent
globalThis.CustomEvent ??=
  /**
   * `CustomEvent` polyfill.
   * @template [T=unknown]
   * @type {globalThis.CustomEvent<T>}
   */
  class CustomEvent extends Event {
    /**
     * @param {string} type Event type.
     * @param {CustomEventInit<T>} [options] Custom event options.
     */
    constructor(type, options = {}) {
      // Workaround a TypeScript bug:
      // https://github.com/microsoft/TypeScript/issues/50286
      const { detail, ...eventOptions } = options;
      super(type, eventOptions);
      if (detail) this.detail = detail;
    }

    /** @deprecated */
    initCustomEvent() {}
  };
