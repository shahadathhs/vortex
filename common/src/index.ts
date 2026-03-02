/**
 * @vortex/common
 *
 * Shared utilities, core logic, and middlewares for the Vortex microservices platform
 */

// Constants & Enums
export * from './constants';

// Core Logic (Messaging, JWT)
export * from './core/jwt';
export * from './core/rabbit-mq-manager';

// Error Handling
export * from './errors/api-errors';
export * from './errors/error-handler';
export * from './errors/error-types';
export * from './errors/mongoose-error-parser';
export { simplifyError } from './errors/simplify-error';

// Middleware
export * from './middleware/api-info-logger';
export * from './middleware/auth';
export * from './middleware/not-found';
export * from './middleware/rbac';
export * from './middleware/validate-request';

// Utilities
export * from './utils/async-handler';
export * from './utils/logger';
export * from './utils/response';

// Schemas
export * from './schemas/pagination';

// Type definitions
export * from './types/amqplib';
export * from './types/auth';
