import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateRequest } from '@vortex/common';
import { loginSchema, registerSchema } from '../schemas/auth.schema';

const router: Router = Router();

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);

export default router;
