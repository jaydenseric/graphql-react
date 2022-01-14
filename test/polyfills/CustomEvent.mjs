// @ts-check

if (!("CustomEvent" in global))
  global.CustomEvent =
    /**
     * `CustomEvent` polyfill.
     * @type {typeof global.CustomEvent}
     */
    class CustomEvent extends global.Event {
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
