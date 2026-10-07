const pool = require('../database/pool')

async function getAllTopics() {
  const sql = `
    SELECT 
      t.id, 
      t.name, 
      t.description, 
      COUNT(q.id) AS question_count
    FROM topics t
    LEFT JOIN questions q ON t.id = q.topic_id
    GROUP BY t.id
    ORDER BY t.name ASC
  `
  const [rows] = await pool.query(sql)
  return rows
}

async function getTopicById(id) {
  const sql = 'SELECT id, name, description FROM topics WHERE id = ?'
  const [rows] = await pool.query(sql, [id])
  return rows[0] || null
}

module.exports = {
  getAllTopics,
  getTopicById,
}
