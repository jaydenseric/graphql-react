import 'cross-fetch/dist/node-polyfill.js';
import { rejects, strictEqual } from 'assert';
import React from 'react';
import { ssr } from '../../server/index.mjs';
import { GraphQL, GraphQLContext, useGraphQL } from '../../universal/index.mjs';
import createGraphQLKoaApp from '../createGraphQLKoaApp.js';
import listen from '../listen.js';

export default (tests) => {
  tests.add('`ssr` argument 1 validation', async () => {
    const error = new Error('ssr() argument 1 must be a GraphQL instance.');

    await rejects(ssr(), error);
    await rejects(ssr(true), error);
  });

  tests.add('`ssr` argument 2 validation', async () => {
    const graphql = new GraphQL();

    await rejects(
      ssr(graphql),
      new Error('ssr() argument 2 must be a React node.')
    );

    strictEqual(await ssr(graphql, undefined), '');
  });

  tests.add('`ssr` argument 3 validation', async () => {
    const graphql = new GraphQL();
    const node = 'a';

    strictEqual(await ssr(graphql, node), node);

    await rejects(
      ssr(graphql, node, false),
      new Error('ssr() argument 3 must be a function.')
    );
  });

  tests.add('`ssr` with the `useGraphQL` hook', async () => {
    const { port, close } = await listen(createGraphQLKoaApp());

    try {
      // eslint-disable-next-line react/prop-types
      const Phrase = ({ phrase, children }) => {
        const { cacheValue } = useGraphQL({
          fetchOptionsOverride(options) {
            options.url = `http://localhost:${port}`;
          },
          operation: { query: `{ echo(phrase: "${phrase}") }` },
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
            <Phrase phrase="b">
              <Phrase phrase="c" />
            </Phrase>
          </GraphQLContext.Provider>
        ),
        '<p>b</p><p>c</p>'
      );
    } finally {
      close();
    }
  });
};
