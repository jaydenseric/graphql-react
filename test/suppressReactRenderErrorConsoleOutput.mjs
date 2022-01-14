// @ts-check

import filterConsole from "filter-console";

/**
 * Replaces the `console` global to suppress React render error output. Useful
 * for testing specific render errors.
 * @returns {() => void} Reverts the `console` global.
 * @see [Similar utility in `@testing-library/react-hooks`](https://github.com/testing-library/react-hooks-testing-library/blob/5bae466de7155d9654194d81b5c0c3c2291b9a15/src/core/console.ts#L1-L17).
 */
export default function suppressReactRenderErrorConsoleOutput() {
  return filterConsole([/^The above error occurred in the <\w+> component:/u], {
    methods: ["error"],
  });
}
