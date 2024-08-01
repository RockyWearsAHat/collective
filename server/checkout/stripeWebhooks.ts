import { Router, Request, Response } from "express";

export const stripeWebhookRouter = Router();

stripeWebhookRouter.post("/", (req: Request, res: Response) => {
  const event = req.body;

  console.log(event);
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log(`Success ${paymentIntent}`);
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      return res.json({
        received: true,
        client_secret: paymentIntent.client_secret
      });
    case "payment_method.attached":
      const paymentMethod = event.data.object;
      console.log(`PaymentMethod was attached to a Customer ${paymentMethod}`);
      console.log("testing");
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
      break;
  }

  // Return a response to acknowledge receipt of the event
  return res.json({ received: true });
});
