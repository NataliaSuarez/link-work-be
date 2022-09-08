import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { join } from 'path';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  useFactory: async (): Promise<TypeOrmModuleOptions> => {
    return {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_CA_CERT ? { ca: process.env.DB_CA_CERT } : null,
      autoLoadEntities: true,
      synchronize: process.env.DB_ORM_SYNC == 'true',
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
      migrationsTableName: 'migrations_table',
    };
  },
};
