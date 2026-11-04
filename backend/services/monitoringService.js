const { randomUUID } = require('node:crypto')
const { createMonitor, MONITORING_EVENTS } = require('../../shared/monitoring.mjs')
const pool = require('../database/pool')

// The caller owns the transaction. Never expose this writer or junction over HTTP.
function databaseMonitor(connection) {
  return createMonitor(async ({ type, userId }) => {
    if (!Number.isSafeInteger(userId) || userId < 1) {
      throw new TypeError('A real authenticated account is required for monitoring')
    }
    await connection.execute(
      `INSERT INTO monitoring_users (user_id, monitoring_user_id) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE user_id = user_id`,
      [userId, randomUUID()],
    )
    const [[identity]] = await connection.execute(
      'SELECT monitoring_user_id FROM monitoring_users WHERE user_id = ?',
      [userId],
    )
    await connection.execute(
      `INSERT INTO monitoring_events (monitoring_user_id, event_type, occurred_at)
       VALUES (?, ?, UTC_TIMESTAMP(3))`,
      [identity.monitoring_user_id, type],
    )
  })
}

async function readMonitoringLog(userId) {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    // Include this read in the returned snapshot; never return a log without auditing it.
    await databaseMonitor(connection).log(MONITORING_EVENTS.LOG_READ, { userId })
    const [events] = await connection.execute(
      `SELECT id, monitoring_user_id, event_type,
              DATE_FORMAT(occurred_at, '%Y-%m-%dT%H:%i:%s.%fZ') AS occurred_at
       FROM monitoring_events ORDER BY id DESC LIMIT 100`,
    )
    await connection.commit()
    return events
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

module.exports = { databaseMonitor, readMonitoringLog, MONITORING_EVENTS }
