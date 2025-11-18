import { Pool, QueryResult, QueryResultRow } from 'pg';

const poolConfig: any = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
};

if (process.env.DB_PASSWORD) {
  poolConfig.password = process.env.DB_PASSWORD;
}

if (process.env.DB_PORT) {
  poolConfig.port = parseInt(process.env.DB_PORT);
}

const pool = new Pool(poolConfig);

export default {
  query: <T extends QueryResultRow = any>(
    text: string,
    params?: any[],
    callback?: (err: Error, result: QueryResult<T>) => void
  ): Promise<QueryResult<T>> => {
    if (callback) {
      pool.query(text, params || [], callback);
      return Promise.resolve({} as QueryResult<T>);
    }
    return pool.query(text, params || []);
  },
};
