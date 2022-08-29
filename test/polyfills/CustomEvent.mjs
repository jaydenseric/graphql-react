// @ts-check

if (!("CustomEvent" in globalThis))
  globalThis.CustomEvent =
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
