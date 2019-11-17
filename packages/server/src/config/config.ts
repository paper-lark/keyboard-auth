import { ConnectionOptions } from 'typeorm';
import path from 'path';

export interface Configuration {
  port: number;
  db: ConnectionOptions;
}

export namespace ConfigurationSource {
  export function get(): Configuration {
    return {
      port: process.env.GRPC_PORT ? Number(process.env.GRPC_PORT) : 3000,
      db: {
        type: 'postgres',
        host: process.env.PG_HOST || 'localhost',
        port: process.env.PG_PORT ? Number(process.env.PG_PORT) : 12001,
        username: process.env.PG_USER || 'postgres',
        password: process.env.PG_PASSWORD || '',
        database: process.env.PG_DB || 'project',
        entities: [path.resolve('src/entities/*.ts')],
        synchronize: true
      }
    };
  }
}
