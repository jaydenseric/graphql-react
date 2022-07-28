// @ts-check

import ReactTestRenderer from "react-test-renderer";

/**
 * Creates a React test renderer.
 * @param {import("react").ReactNode} reactRoot Root React node to render.
 */
export default function createReactTestRenderer(reactRoot) {
  /** @type {import("react-test-renderer").ReactTestRenderer | undefined} */
  let testRenderer;

  ReactTestRenderer.act(() => {
    testRenderer = ReactTestRenderer.create(
      // @ts-ignore The React types are incorrect.
      reactRoot
    );
  });

  return /** @type {import("react-test-renderer").ReactTestRenderer} */ (
    testRenderer
  );
}
