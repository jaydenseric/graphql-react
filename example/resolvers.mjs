const timers = {}

export default {
  Query: {
    timer: (obj, { timerId }) => timers[timerId],
    timers: () => Object.values(timers)
  },
  Mutation: {
    createTimer: () => {
      const startDate = new Date()
      const id = startDate.getTime()
      return (timers[id] = { id, startDate })
    }
  },
  Timer: {
    milliseconds: ({ startDate }) => new Date() - startDate
  }
}
