import { getSafeEnv } from 'src/utils/getSafeEnv';

export default () => ({
  db_host: getSafeEnv('DB_HOST'),
  db_port: getSafeEnv('DB_PORT'),
  db_username: getSafeEnv('DB_USERNAME'),
  db_password: getSafeEnv('DB_PASSWORD'),
  db_database: getSafeEnv('DB_DATABASE'),
  jwt_secret: getSafeEnv('JWT_SECRET'),
});
