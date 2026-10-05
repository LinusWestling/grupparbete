const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');

async function runMigrations(connection, directory, log = console.log) {
    const files = (await fs.readdir(directory)).filter(file => file.endsWith('.sql')).sort();
    for (const file of files) {
        if (!/^\d{3}_[a-zA-Z0-9_-]+\.sql$/.test(file)) {
            throw new Error(`Invalid migration filename: ${file}. Use 001_description.sql.`);
        }
    }

    // Serialize deploys so two starting services cannot apply the same migration.
    const [[{ database }]] = await connection.query('SELECT DATABASE() AS `database`');
    const lockName = `migrations:${createHash('sha256').update(database).digest('hex').slice(0, 48)}`;
    const [[{ acquired }]] = await connection.query('SELECT GET_LOCK(?, 60) AS acquired', [lockName]);
    if (Number(acquired) !== 1) throw new Error('Could not acquire the database migration lock.');

    try {
        await connection.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
            filename VARCHAR(255) NOT NULL PRIMARY KEY,
            checksum CHAR(64) NOT NULL,
            applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`);
        const [rows] = await connection.query('SELECT filename, checksum FROM schema_migrations');
        const applied = new Map(rows.map(row => [row.filename, row.checksum]));
        const migrations = await Promise.all(files.map(async filename => {
            const sql = await fs.readFile(path.join(directory, filename), 'utf8');
            const checksum = createHash('sha256').update(sql.replace(/\r\n/g, '\n')).digest('hex');
            return { filename, sql, checksum };
        }));

        // Check all existing files before applying any new ones.
        for (const migration of migrations) {
            if (applied.has(migration.filename) && applied.get(migration.filename) !== migration.checksum) {
                throw new Error(`Applied migration was changed: ${migration.filename}. Restore it and add a new migration.`);
            }
        }
        for (const { filename, sql, checksum } of migrations) {
            if (applied.has(filename)) {
                log(`Skipping ${filename} (already applied).`);
                continue;
            }
            log(`Applying ${filename}...`);
            try {
                await connection.query(sql);
                await connection.execute(
                    'INSERT INTO schema_migrations (filename, checksum) VALUES (?, ?)',
                    [filename, checksum]
                );
            } catch (error) {
                throw new Error(`Migration ${filename} failed. Some SQL may already have taken effect; inspect the database before retrying.`, { cause: error });
            }
            log(`Applied ${filename}.`);
        }
        log('Migrations complete.');
    } finally {
        await connection.query('SELECT RELEASE_LOCK(?)', [lockName]);
    }
}

async function main() {
    const mysql = require('mysql2/promise');
    const config = require('../database/config');
    for (const key of ['host', 'user', 'database']) {
        if (!config[key]) throw new Error(`Missing database configuration: ${key}.`);
    }
    // Only the migration connection allows multiple statements, from trusted repo files.
    const connection = await mysql.createConnection({ ...config, multipleStatements: true });
    try {
        await runMigrations(connection, path.join(__dirname, '..', 'database', 'migrations'));
    } finally {
        await connection.end();
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error(error.message);
        if (error.cause) {
            console.error(error.cause.code || 'SQL execution failed.');
            console.error(error.cause.sqlMessage || error.cause.message);
        }
        process.exitCode = 1;
    });
}

module.exports = { runMigrations };
