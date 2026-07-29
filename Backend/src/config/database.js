import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'sacco_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      underscored: false,
      freezeTableName: true,
      paranoid: true, // enables deletedAt (soft delete) globally
      timestamps: true,
    },
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      ...(process.env.NODE_ENV === 'production' && {
        ssl: { rejectUnauthorized: false },
      }),
    },
  }
);

export const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ MySQL database connection established successfully');
  } catch (error) {
    logger.warn(`⚠️ MySQL connection notice: ${error.message}. Ensure MySQL server is running or update credentials in .env.`);
  }
};

export default sequelize;
