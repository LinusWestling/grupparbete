// Read-only inspection. Uses the same connection configuration as migrations.
const mysql = require('mysql2/promise')
const config = require('../database/config')

async function main() {
  const connection = await mysql.createConnection(config)
  try {
    const [[context]] = await connection.query('SELECT DATABASE() AS configured_database')
    console.log(context)
    const [tables] = await connection.execute(
      `SELECT TABLE_SCHEMA, TABLE_NAME FROM information_schema.TABLES
             WHERE TABLE_SCHEMA IN (?, 'skillswap') ORDER BY TABLE_SCHEMA, TABLE_NAME`,
      [context.configured_database],
    )
    console.table(tables)
    for (const schema of new Set([context.configured_database, 'skillswap'])) {
      const tracking = tables.some(
        (row) => row.TABLE_SCHEMA === schema && row.TABLE_NAME === 'schema_migrations',
      )
      if (!tracking) {
        console.log(`${schema}: no schema_migrations table`)
        continue
      }
      const [rows] = await connection.query(
        'SELECT filename, checksum, applied_at FROM ??.schema_migrations ORDER BY filename',
        [schema],
      )
      console.log(`Migration history in ${schema}:`)
      console.table(rows)
    }
  } finally {
    await connection.end()
  }
}

main().catch((error) => {
  console.error(error.code || 'Inspection failed')
  console.error(error.sqlMessage || error.message)
  process.exitCode = 1
})
