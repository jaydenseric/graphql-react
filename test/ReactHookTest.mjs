// @ts-check

import useForceUpdate from "../useForceUpdate.mjs";

/**
 * React component for testing a React hook.
 * @template {() => HookReturnType} Hook React hook type.
 * @template HookReturnType React hook return type.
 * @param {object} props Props.
 * @param {Hook} props.useHook React hook.
 * @param {Array<ReactHookResult<HookReturnType>>} props.results React hook
 *   render results.
 */
export default function ReactHookTest({ useHook, results }) {
  const rerender = useForceUpdate();

  /** @type {ReactHookResult<HookReturnType>} */
  let result;

  try {
    const returned = useHook();

    result = { rerender, returned };
  } catch (threw) {
    result = { rerender, threw };
  }

  results.push(result);

  return null;
}

/**
 * React hook render result.
 * @template [HookReturnType=unknown]
 * @typedef {Readonly<
 *   ReactHookResultReturned<HookReturnType>
 * > | Readonly<
 *   ReactHookResultThrew
 * >} ReactHookResult
 */

/**
 * Result if the React hook returned.
 * @template [HookReturnType=unknown]
 * @typedef {object} ReactHookResultReturned
 * @prop {() => void} rerender Forces the component to re-render.
 * @prop {HookReturnType} returned What the hook returned.
 */

/**
 * Result if the React hook threw.
 * @typedef {object} ReactHookResultThrew
 * @prop {() => void} rerender Forces the component to re-render.
 * @prop {unknown} threw What the hook threw.
 */
