export default `
  type Query {
    timer(timerId: ID!): Timer!
    timers: [Timer]!
  }

  type Mutation {
    createTimer: Timer!
  }

  type Timer {
    id: ID!
    milliseconds: Int!
  }
`
