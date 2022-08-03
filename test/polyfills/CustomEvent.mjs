// @ts-check

if (!("CustomEvent" in globalThis))
  globalThis.CustomEvent =
    /**
     * `CustomEvent` polyfill.
     * @type {typeof globalThis.CustomEvent}
     */
    class CustomEvent extends globalThis.Event {
      /**
       * @param {string} type Event type.
       * @param {CustomEventInit} [eventInitDict] Custom event options.
       */
      constructor(type, { detail, ...eventOptions } = {}) {
        super(type, eventOptions);
        this.detail = detail;
      }

      /** @deprecated */
      initCustomEvent() {}
    };
