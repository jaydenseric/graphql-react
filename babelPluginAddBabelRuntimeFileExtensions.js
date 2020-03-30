'use strict';

/**
 * A Babel plugin that adds missing `.js` file extensions to Babel runtime
 * import specifiers.
 * @param {object} babel Current Babel object.
 * @returns {object} Babel plugin object.
 * @see [babel/babel#8462](https://github.com/babel/babel/issues/8462).
 * @ignore
 */
module.exports = function babelPluginAddBabelRuntimeFileExtensions({ types }) {
  return {
    visitor: {
      'ImportDeclaration|ExportNamedDeclaration'(path) {
        if (
          path.node.source &&
          path.node.source.value.startsWith('@babel/runtime/helpers/') &&
          !path.node.source.value.endsWith('.js')
        )
          path
            .get('source')
            .replaceWith(types.stringLiteral(`${path.node.source.value}.js`));
      },
    },
  };
};
