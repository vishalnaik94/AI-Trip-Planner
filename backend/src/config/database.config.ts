import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const databaseUrl = configService.get<string>('DATABASE_URL');

  return {
    type: 'postgres',
    // Priority 1: Use the full connection string if available (Railway/Production)
    // Priority 2: Use individual parts (Local Development)
    url: databaseUrl,
    host: !databaseUrl ? configService.get<string>('DB_HOST', 'localhost') : undefined,
    port: !databaseUrl ? configService.get<number>('DB_PORT', 5432) : undefined,
    username: !databaseUrl ? configService.get<string>('DB_USERNAME', 'user') : undefined,
    password: !databaseUrl ? configService.get<string>('DB_PASSWORD', 'password') : undefined,
    database: !databaseUrl ? configService.get<string>('DB_NAME', 'tripplanner') : undefined,
    
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    
    // Safety: only sync and log in development
    synchronize: !isProduction,
    logging: !isProduction,

    // MANDATORY FOR RAILWAY:
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    
    // Senior Tip: optimize pool for cloud environments
    extra: isProduction ? {
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    } : undefined,
  };
};