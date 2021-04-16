'use strict';

const { strictEqual } = require('assert');
const { useContext } = require('react');
const ReactTestRenderer = require('react-test-renderer');
const { jsx } = require('react/jsx-runtime');
const HydrationTimeStampContext = require('../../public/HydrationTimeStampContext');

module.exports = (tests) => {
  tests.add('`HydrationTimeStampContext` used as a React context.', () => {
    const TestComponent = () => useContext(HydrationTimeStampContext);
    const contextValue = 'a';
    const testRenderer = ReactTestRenderer.create(
      jsx(HydrationTimeStampContext.Provider, {
        value: contextValue,
        children: jsx(TestComponent, {}),
      })
    );

    strictEqual(testRenderer.toJSON(), contextValue);
  });
};
