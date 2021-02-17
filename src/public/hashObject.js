'use strict';

const fnv1a = require('fnv1a');

/**
 * `JSON.stringify()` replacer that converts
 * [`FormData`](https://developer.mozilla.org/docs/Web/API/FormData) instances
 * into a signature string.
 * @param {string} key Property name.
 * @param {*} value Property value.
 * @returns {*} Original value or replaced value if it was a `FormData` instance.
 * @ignore
 */
function hashObjectReplacer(key, value) {
  // Retrieve the original value, and not the possible .toJSON() version. When a
  // value has a .toJSON() method, JSON.stringify provides the replacer
  // function with output of that instead of the original value. FormData
  // instances in browsers do not have a .toJSON() method, but some polyfill
  // implementations might.
  // See: https://github.com/octet-stream/form-data/issues/2
  const originalValue = this[key];

  if (typeof FormData !== 'undefined' && originalValue instanceof FormData) {
    // Value is a FormData instance. The idea is to return a string representing
    // the unique signature of the form, to be hashed with the surrounding JSON
    // string. Note that FormData forms can have multiple fields with the same
    // name and that the order of form fields also determines the signature.

    let signature = '';

    const fields = originalValue.entries();

    // Iterate manually using next() to avoid bulky for … of syntax
    // transpilation.
    let field = fields.next();
    while (!field.done) {
      const [name, value] = field.value;

      // If the value is a File or Blob instance, it should cast to a string
      // like `[object File]`. It would be good if there was a way to signature
      // File or Blob instances.
      signature += `${name}${value}`;

      field = fields.next();
    }

    return signature;
  }

  // Let JSON.stringify() stringify the value as normal.
  return value;
}

/**
 * Hashes an object.
 * @kind function
 * @name hashObject
 * @param {object} object A JSON serializable object that may contain [`FormData`](https://developer.mozilla.org/docs/Web/API/FormData) instances.
 * @returns {string} A hash.
 * @see [`GraphQLCacheKeyCreator` functions]{@link GraphQLCacheKeyCreator} may use this to derive a [GraphQL cache]{@link GraphQL#cache} [key]{@link GraphQLCacheKey}.
 * @see [`GraphQL`]{@link GraphQL} instance method [`operate`]{@link GraphQL#operate} uses this as a default value for `options.cacheKeyCreator`.
 * @see [`useGraphQL`]{@link useGraphQL} React hook this uses this as a default value for `options.cacheKeyCreator`.
 * @example <caption>Ways to `import`.</caption>
 * ```js
 * import { hashObject } from 'graphql-react';
 * ```
 *
 * ```js
 * import hashObject from 'graphql-react/public/hashObject.js';
 * ```
 * @example <caption>Ways to `require`.</caption>
 * ```js
 * const { hashObject } = require('graphql-react');
 * ```
 *
 * ```js
 * const hashObject = require('graphql-react/public/hashObject');
 * ```
 */
module.exports = function hashObject(object) {
  return fnv1a(JSON.stringify(object, hashObjectReplacer)).toString(36);
};
