import Koa from 'koa'
import next from 'next'
import Router from 'koa-router'
import koaBody from 'koa-bodyparser'
import apolloServerKoa from 'apollo-server-koa'
import graphqlTools from 'graphql-tools'
import typeDefs from './typedefs'
import resolvers from './resolvers'

const router = new Router()
  .post(
    '/graphql',
    koaBody(),
    apolloServerKoa.graphqlKoa({
      schema: graphqlTools.makeExecutableSchema({ typeDefs, resolvers })
    })
  )
  .get('*', async ctx => {
    ctx.status = 200
    ctx.respond = false
    await nextRequestHandler(ctx.req, ctx.res)
  })

const nextApp = next({ dev: process.env.NODE_ENV === 'development' })
const nextRequestHandler = nextApp.getRequestHandler()
const port = 3000

nextApp.prepare().then(() =>
  new Koa()
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(port, error => {
      if (error) throw error
      // eslint-disable-next-line no-console
      console.info(
        `Serving http://localhost:${port} for ${process.env.NODE_ENV}.`
      )
    })
)
