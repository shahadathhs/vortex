import { Router, Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { generateToken } from '../../../common/jwt-util';
import { AppError } from '../../../common/error-handler';

const router = Router();

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new AppError('Email and password are required', 400);
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError('User already exists', 400);
        }

        const user = await User.create({ email, password });
        res.status(201).json({
            message: 'User registered successfully',
            user: { id: user._id, email: user.email },
        });
    } catch (error) {
        next(error);
    }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await (user as any).comparePassword(password))) {
            throw new AppError('Invalid credentials', 401);
        }

        const token = generateToken({ id: (user._id as any).toString(), email: user.email });
        res.json({ token, user: { id: user._id, email: user.email } });
    } catch (error) {
        next(error);
    }
});

export default router;
