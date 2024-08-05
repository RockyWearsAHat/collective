import { Router, Request, Response } from "express";
import { Item } from "../../db/models/item";
import Stripe from "stripe";
import { sendEmail } from "../emails/sendEmail";
import ReactDOMServer from "react-dom/server";
import { OrderEmail } from "../../emails/OrderEmail";

//In percent, 0-100
const artistCollectiveCut = 20;

export const stripeWebhookRouter = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

      let cartItems = [];

      //Calculate artist cut
      for (let i = 0; i < cart.length; i++) {
        const item = await Item.findById(cart[i].i).populate(
          "userCreatedId",
          "stripeId"
        );

        cartItems.push({ item, quantity: cart[i].q });

        if (!item) continue;
        const artistCut =
          Number.parseFloat(
            item.salePrice ? item.salePrice.toString() : item.price.toString()
          ) *
          Number.parseInt(cart[i].q) *
          (100 - artistCollectiveCut);

        const artistId = (item.userCreatedId as any).stripeId;

        console.log(
          `${artistId} gets $${Number.parseInt(artistCut.toFixed(0)) / 100}`
        );

        console.log(paymentIntent.latest_charge);

        // Create transfer to the artist
        const transfer = await stripe.transfers.create({
          amount: Number.parseInt(artistCut.toFixed(0)), // Amount in cents
          currency: "usd",
          source_transaction: paymentIntent.latest_charge,
          destination: artistId,
          description: `Payment for ${cart[i].q}x ${item.name} - $${item.salePrice ? item.salePrice : item.price} per`
        });

        console.log(transfer.id);
      }

      console.log(cartItems);

      //Email user
      const emailBody = ReactDOMServer.renderToString(
        OrderEmail({
          name: "Alex",
          orderNumber: paymentIntent.id.split("_")[1],
          cartString: JSON.stringify(cartItems)
        })
      );

      sendEmail({
        to: "alexwaldmann2004@gmail.com",
        subject: "Testing email",
        body: emailBody
      });
      break;
    default:
      //Don't handle other event types
      break;
  }

  // Return a response to acknowledge receipt of the event
  return res.json({ received: true });
});
