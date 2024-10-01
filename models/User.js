const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  async create(username, password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
        [username, hashedPassword]
      );
      return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  async findByUsername(username) {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
  },

  async findAll(limit, offset) {
    const result = await pool.query('SELECT * FROM user LIMIT $1 OFFSET $2', [limit, offset]);
    return result.rows;
  }
};

module.exports = User;
