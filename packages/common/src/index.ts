/**
 * @vortex/common
 *
 * Shared utilities, core logic, and middlewares for the Vortex microservices platform
 */

// Constants & Enums
export * from './constants/constants';

// Core Logic (Config, Messaging, JWT)
export * from './core/Config';
export * from './core/jwt';
export * from './core/RabbitMQManager';

// Error Handling
export * from './errors/ApiErrors';
export * from './errors/errorHandler';
export * from './errors/MongooseErrorParser';

// Middleware
export * from './middleware/auth.middleware';
export * from './middleware/rbac.middleware';
export * from './middleware/validateRequest';

// Utilities
export * from './utils/asyncHandler';
export * from './utils/logger';

// Type definitions
export * from './types/auth';
