import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const databaseUrl = configService.get<string>('DATABASE_URL');

  // Base config shared by both connection modes
  const baseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: !isProduction,
    logging: !isProduction,
    // Replace your current SSL line with this:
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    extra: isProduction ? {
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    } : undefined,
  };

  // Railway / Production: use full DATABASE_URL connection string
  if (databaseUrl) {
    return {
      ...baseConfig,
      url: databaseUrl,
    };
  }

  // Local Development: use individual connection params
  return {
    ...baseConfig,
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'user'),
    password: configService.get<string>('DB_PASSWORD', 'password'),
    database: configService.get<string>('DB_NAME', 'tripplanner'),
  };
};