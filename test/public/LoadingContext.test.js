'use strict';

const { strictEqual } = require('assert');
const { useContext } = require('react');
const ReactTestRenderer = require('react-test-renderer');
const { jsx } = require('react/jsx-runtime');
const LoadingContext = require('../../public/LoadingContext');

module.exports = (tests) => {
  tests.add('`LoadingContext` used as a React context.', () => {
    const TestComponent = () => useContext(LoadingContext);
    const contextValue = 'a';
    const testRenderer = ReactTestRenderer.create(
      jsx(LoadingContext.Provider, {
        value: contextValue,
        children: jsx(TestComponent, {}),
      })
    );

    strictEqual(testRenderer.toJSON(), contextValue);
  });
};
