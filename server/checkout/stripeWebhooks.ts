import { Router, Request, Response } from "express";
// import Stripe from "stripe";

export const stripeWebhookRouter = Router();

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

//In percent, 0-100
const artistCollectiveCut = 20;

stripeWebhookRouter.post("/", async (req: Request, res: Response) => {
  const event = req.body;

  switch (event.type) {
    //On success
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;

      const {
        city,
        country,
        line1,
        line2,
        postal_code,
        state
      }: {
        city: string;
        country: string;
        line1: string;
        line2: string | null;
        postal_code: string;
        state: string;
      } = paymentIntent.shipping.address;
      const fullName: string = paymentIntent.shipping.name;
      const firstName: string = fullName.split(" ")[0];
      const lastName: string = fullName.split(" ")[1];
      const cart: any[] = JSON.parse(paymentIntent.metadata.cart);

      console.log(
        `Address: ${line1}, ${line2 ? `(${line2}), ` : ""}${city} ${state}, ${country}, ${postal_code}, First Name: ${firstName}, Last Name: ${lastName}`
      );
      console.log(cart);

      //Calculate artist cut
      for (let i = 0; i < cart.length; i++) {
        const artistCut =
          Number.parseFloat(cart[i].item.price.substring(1)) *
          Number.parseInt(cart[i].quantity) *
          (100 - artistCollectiveCut);

        const artistId = cart[i].user.stripeId;

        console.log(
          `${artistId} gets $${Number.parseInt(artistCut.toFixed(0)) / 100}`
        );

        // Create transfer to the artist
        // const transfer = await stripe.transfers.create({
        //   amount: artistCut, // Amount in cents
        //   currency: "usd",
        //   destination: artistId
        // });

        // console.log(transfer.id);
      }
      break;
    default:
      //Don't handle other event types
      break;
  }

  // Return a response to acknowledge receipt of the event
  return res.json({ received: true });
});
