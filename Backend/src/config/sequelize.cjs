// CJS module — sequelize-cli does not support ES Modules natively
// This reads the same .env values used by the application
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'sacco_user',
    password: process.env.DB_PASSWORD || 'sacco_password',
    database: process.env.DB_NAME || 'sacco_db',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4',
    },
    define: {
      underscored: false,
      freezeTableName: true,
      paranoid: true,
      timestamps: true,
    },
    seederStorage: 'sequelize',
    migrationStorage: 'sequelize',
  },
  test: {
    username: process.env.DB_USER || 'sacco_user',
    password: process.env.DB_PASSWORD || 'sacco_password',
    database: `${process.env.DB_NAME || 'sacco_db'}_test`,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      charset: 'utf8mb4',
      ssl: { rejectUnauthorized: false },
    },
    pool: { max: 10, min: 2, acquire: 30000, idle: 10000 },
  },
};
