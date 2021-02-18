'use strict';

const { strictEqual } = require('assert');
const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const FirstRenderDateContext = require('../../private/FirstRenderDateContext');

module.exports = (tests) => {
  tests.add('`FirstRenderDateContext` used as a React context.', () => {
    const TestComponent = () => React.useContext(FirstRenderDateContext);
    const contextValue = 'abc';
    const testRenderer = ReactTestRenderer.create(
      <FirstRenderDateContext.Provider value={contextValue}>
        <TestComponent />
      </FirstRenderDateContext.Provider>
    );

    strictEqual(testRenderer.toJSON(), contextValue);
  });
};
