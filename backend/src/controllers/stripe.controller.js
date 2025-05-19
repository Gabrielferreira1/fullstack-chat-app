  import Stripe from 'stripe';
  import dotenv from 'dotenv';
  import User from '../models/user.model';

  dotenv.config();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  export const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const plan = session.line_items[0].price.product_data.name.toLowerCase();

      try {
        await User.findByIdAndUpdate(userId, {
          subscriptionPlan: plan,
          isProfilePublic: plan === 'pro',
        });
      } catch (error) {
        return res.status(500).send(`Erro ao atualizar usuário: ${error.message}`);
      }
    }

    res.status(200).send('Evento recebido');
  };
