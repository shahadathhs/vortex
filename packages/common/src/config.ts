import { z, ZodRawShape } from 'zod';
export { z };
import dotenv from 'dotenv';
import path from 'path';

// Load .env from the current working directory (the service directory)
dotenv.config({ path: path.join(process.cwd(), '.env') });

const baseEnvSchema = {
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().optional(), // Not all services might need a DB
  RABBITMQ_URL: z.string().default('amqp://127.0.0.1'),
  JWT_SECRET: z.string().optional(),
};

/**
 * Validates environment variables with a base schema plus service-specific extensions.
 * This ensures each service only validates what it actually needs,
 * but follows a unified pattern.
 */
export const validateConfig = <T extends ZodRawShape>(serviceSchema: T, defaultPort: number) => {
  const mergedSchema = z.object({
    ...baseEnvSchema,
    PORT: z.string().default(defaultPort.toString()),
    ...serviceSchema,
  });

  const result = mergedSchema.safeParse(process.env);

  if (!result.success) {
    console.error(
      '❌ Invalid environment variables:',
      JSON.stringify(result.error.format(), null, 2),
    );
    process.exit(1);
  }

  // Convert PORT to number for convenience
  return {
    ...result.data,
    PORT: parseInt(result.data.PORT as string, 10),
  } as z.infer<typeof mergedSchema> & { PORT: number };
};
