/**
 * @vortex/common
 *
 * Shared utilities, core logic, and middlewares for the Vortex microservices platform
 */

// Constants & Enums
export * from './constants';

// Core Logic (Config, Messaging, JWT)
export * from './core/config';
export * from './core/jwt';
export * from './core/rabbit-mq-manager';

// Error Handling
export * from './errors/api-errors';
export * from './errors/error-handler';
export * from './errors/mongoose-error-parser';

// Middleware
export * from './middleware/auth';
export * from './middleware/rbac';
export * from './middleware/validate-request';

// Utilities
export * from './utils/async-handler';
export * from './utils/logger';

// Type definitions
export * from './types/auth';
