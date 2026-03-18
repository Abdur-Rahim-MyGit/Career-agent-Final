require('dotenv').config();

const executeQuery = async (query, params = []) => {
  // Mocked for SQLite usage. Real raw queries are disabled.
  return [];
};

const initializeDB = async () => {
  // Mocked for SQLite usage
  console.log('✅ SQLite Database active for testing. (PostgreSQL bypassed)');
};

module.exports = {
  executeQuery,
  initializeDB
};
