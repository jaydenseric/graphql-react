'use strict';

const { strictEqual } = require('assert');
const { useContext } = require('react');
const ReactTestRenderer = require('react-test-renderer');
const { jsx } = require('react/jsx-runtime');
const CacheContext = require('../../public/CacheContext');

module.exports = (tests) => {
  tests.add('`CacheContext` used as a React context.', () => {
    const TestComponent = () => useContext(CacheContext);
    const contextValue = 'a';
    const testRenderer = ReactTestRenderer.create(
      jsx(CacheContext.Provider, {
        value: contextValue,
        children: jsx(TestComponent, {}),
      })
    );

    strictEqual(testRenderer.toJSON(), contextValue);
  });
};
