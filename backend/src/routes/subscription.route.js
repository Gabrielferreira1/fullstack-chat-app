import express from 'express';
import { createSubscription } from '../controllers/subscription.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/create-checkout-session', authenticate, createSubscription);

export default router;
