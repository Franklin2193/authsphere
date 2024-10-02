const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  async create(username, password, role = 2) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *',
        [username, hashedPassword, role]
      );
      return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query('SELECT id, username, role FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  async findByUsername(username) {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
  },

  async findAll(limit = 10, offset = 0) {
    const result = await pool.query('SELECT id, username, role FROM users LIMIT $1 OFFSET $2', [limit, offset]);
    return result.rows;
  }
};

module.exports = User;
