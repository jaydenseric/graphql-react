'use strict';

const { rejects, strictEqual } = require('assert');
const { default: fetch } = require('node-fetch');
const React = require('react');
const revertableGlobals = require('revertable-globals');
const ssr = require('../../server/ssr');
const GraphQL = require('../../universal/GraphQL');
const GraphQLContext = require('../../universal/GraphQLContext');
const hashObject = require('../../universal/hashObject');
const useGraphQL = require('../../universal/useGraphQL');
const createGraphQLKoaApp = require('../createGraphQLKoaApp');
const listen = require('../listen');

module.exports = (tests) => {
  tests.add('`ssr` argument 1 validation', async () => {
    const error = new TypeError('ssr() argument 1 must be a GraphQL instance.');

    await rejects(ssr(), error);
    await rejects(ssr(true), error);
  });

  tests.add('`ssr` argument 2 validation', async () => {
    const graphql = new GraphQL();

    await rejects(
      ssr(graphql),
      new TypeError('ssr() argument 2 must be a React node.')
    );

    strictEqual(await ssr(graphql, undefined), '');
  });

  tests.add('`ssr` argument 3 validation', async () => {
    const graphql = new GraphQL();
    const node = 'a';

    strictEqual(await ssr(graphql, node), node);

    await rejects(
      ssr(graphql, node, false),
      new TypeError('ssr() argument 3 must be a function.')
    );
  });

  tests.add('`ssr` with the `useGraphQL` hook', async () => {
    const revertGlobals = revertableGlobals({ fetch });

    try {
      const { port, close } = await listen(createGraphQLKoaApp());

      try {
        const query = /* GraphQL */ `
          query($phrase: String!) {
            echo(phrase: $phrase)
          }
        `;

        const fetchOptionsOverride = (options) => {
          options.url = `http://localhost:${port}`;
        };

        const cacheKeyCreator = (fetchOptions) =>
          `prefix-${hashObject(fetchOptions)}`;

        // eslint-disable-next-line react/prop-types
        const Phrase = ({ phrase, cacheKeyCreator, children }) => {
          const operation = React.useMemo(
            () => ({
              query,
              variables: {
                phrase,
              },
            }),
            [phrase]
          );

          const { cacheValue } = useGraphQL({
            operation,
            fetchOptionsOverride,
            cacheKeyCreator,
            loadOnMount: true,
          });

          return cacheValue && cacheValue.data ? (
            <>
              <p>{cacheValue.data.echo}</p>
              {children}
            </>
          ) : null;
        };

        const graphql = new GraphQL();

        strictEqual(
          await ssr(
            graphql,
            <GraphQLContext.Provider value={graphql}>
              <Phrase phrase="a" />
            </GraphQLContext.Provider>
          ),
          '<p>a</p>'
        );

        strictEqual(
          await ssr(
            graphql,
            <GraphQLContext.Provider value={graphql}>
              <Phrase phrase="b" cacheKeyCreator={cacheKeyCreator} />
            </GraphQLContext.Provider>
          ),
          '<p>b</p>'
        );

        strictEqual(
          await ssr(
            graphql,
            <GraphQLContext.Provider value={graphql}>
              <Phrase phrase="c">
                <Phrase phrase="d" />
              </Phrase>
            </GraphQLContext.Provider>
          ),
          '<p>c</p><p>d</p>'
        );
      } finally {
        close();
      }
    } finally {
      revertGlobals();
    }
  });
};
