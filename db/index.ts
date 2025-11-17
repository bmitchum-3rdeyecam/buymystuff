import { Pool, QueryResult, QueryResultRow } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
});

export default {
  query: <T extends QueryResultRow = any>(
    text: string,
    params?: any[],
    callback?: (err: Error, result: QueryResult<T>) => void
  ): Promise<QueryResult<T>> => {
    return pool.query(text, params, callback);
  },
};
