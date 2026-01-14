import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export enum GatewayEnv {
  PORT = 'PORT',
}

export const config = {
  PORT: process.env[GatewayEnv.PORT] || 3000,
};
