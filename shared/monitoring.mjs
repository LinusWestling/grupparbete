// No Node, browser, network or database dependencies. The caller supplies storage.
export const MONITORING_EVENTS = Object.freeze({
  QUIZ_STARTED: 'quiz.started',
  QUIZ_FINISHED: 'quiz.finished',
  LOG_READ: 'monitoring.read',
})

export const monitoringLabels = Object.freeze({
  [MONITORING_EVENTS.QUIZ_STARTED]: 'Quiz started',
  [MONITORING_EVENTS.QUIZ_FINISHED]: 'Quiz finished',
  [MONITORING_EVENTS.LOG_READ]: 'Monitoring log read',
})

/**
 * Create a monitor with an injected asynchronous writer, usable in Node or Vue.
 * Writer failures propagate: transaction callers can roll back the business action.
 * @param {(event: {type: string} & Record<string, unknown>) => Promise<unknown>} write
 */
export function createMonitor(write) {
  if (typeof write !== 'function') throw new TypeError('A monitoring writer is required')

  /** Record an event explicitly, e.g. immediately before committing a transaction. */
  async function log(type, details = {}) {
    return write({ ...details, type })
  }

  /**
   * Wrap an async operation: log only after success, preserving its result and `this`.
   * Use log() inside the transaction instead when action + event must commit together.
   * @param {Function} operation
   * @param {string} type
   * @param {(result: unknown, args: unknown[]) => object} details
   */
  function wrap(operation, type, details = () => ({})) {
    return async function (...args) {
      const result = await operation.apply(this, args)
      await log(type, details(result, args))
      return result
    }
  }

  return { log, wrap }
}
