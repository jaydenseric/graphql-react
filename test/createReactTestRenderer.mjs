// @ts-check

/**
 * @import { ReactNode } from "react"
 * @import { ReactTestRenderer as TestRenderer } from "react-test-renderer"
 */

import ReactTestRenderer from "react-test-renderer";

/**
 * Creates a React test renderer.
 * @param {ReactNode} reactRoot Root React node to render.
 */
export default function createReactTestRenderer(reactRoot) {
  /** @type {TestRenderer | undefined} */
  let testRenderer;

  ReactTestRenderer.act(() => {
    testRenderer = ReactTestRenderer.create(
      // @ts-ignore The React types are incorrect.
      reactRoot,
    );
  });

  return /** @type {TestRenderer} */ (testRenderer);
}
