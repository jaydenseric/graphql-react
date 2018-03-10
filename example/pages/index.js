import { Fragment } from 'react'
import provider from '../provider'
import CacheResetter from '../components/cache-resetter'
import CreateTimer from '../components/create-timer'
import Timers from '../components/timers'

export default provider(
  <Fragment>
    <h1>Example Next.js app &amp; GraphQL API</h1>
    <Timers />
    <CreateTimer />
    <CacheResetter />
  </Fragment>
)
