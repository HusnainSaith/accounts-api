import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'accounts_api',

  // Use glob pattern for entities
  entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'],

  // This matches migration files in src/database/migrations folder
  migrations: [__dirname + '/../database/migrations/*.{ts,js}'],

  // Always use migrations in production!
  synchronize: false,

  logging: process.env.TYPEORM_LOGGING === 'true',

  // Connection pool configuration
  extra: {
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 20,
  },
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
