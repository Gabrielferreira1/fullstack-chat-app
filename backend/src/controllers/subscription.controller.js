import { createCheckoutSession } from '../services/stripe.service';

export const createSubscription = async (req, res) => {
  const { plan } = req.body;
  const userId = req.user.id;

  try {
    const session = await createCheckoutSession(userId, plan);
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
