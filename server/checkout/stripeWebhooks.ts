import { Router, Request, Response } from "express";
import { Item } from "../../db/models/item";
import { User } from "../../db/models/user";
import Stripe from "stripe";
// import { sendEmail } from "../emails/sendEmail";
// import ReactDOMServer from "react-dom/server";
// import { OrderEmail } from "../../emails/OrderEmail";
// import { CartItem, ICartItem } from "../../db/models/cartItem";
// import { ObjectId } from "mongoose";
// import { CartItem } from "../../db/models/cartItem";

//In percent, 0-100
const artistCollectiveCut = 10;

export const stripeWebhookRouter = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

stripeWebhookRouter.post("/", async (req: Request, res: Response) => {
  const event = req.body;

  // console.log(event);

  switch (event.type) {
    //On success
    case "payment_intent.succeeded":
      // console.log("payment intent success");
      const paymentIntent = event.data.object;

      //Clear payment intent from user if logged in
      const userId = paymentIntent.metadata.userId;
      if (userId) {
        const user = await User.findOne({
          checkoutSecret: paymentIntent.client_secret
        });

        if (user) {
          user.checkoutClientSecret = null;
          await user.save();
        }
      }

      //Get all the address/name data
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

      //Use them for the time being so no TS errors
      console.log(
        `Address: ${line1}, ${line2 ? `(${line2}), ` : ""}${city} ${state}, ${country}, ${postal_code}, First Name: ${firstName}, Last Name: ${lastName}`
      );

      const cart = JSON.parse(paymentIntent.metadata.cart);

      // //Calculate artist cut
      for (let i = 0; i < cart.length; i++) {
        let item = await Item.findById(cart[i].i).populate("userCreatedId");
        if (!item) continue; //Should never hit???? Item must exist for it to be purchased, but ts errors??

        item.timesPurchased = item.timesPurchased ? item.timesPurchased + cart[i].q : cart[i].q;
        await item.save();

        console.log(item);

        const artistCutPerItem =
          Number.parseFloat(item.salePrice ? item.salePrice.toString() : item.price.toString()) *
          (100 - artistCollectiveCut);

        const artistCut = artistCutPerItem * (typeof cart[i].q === "number" ? cart[i].q : 1);

        const artistId = (item.userCreatedId as any).stripeId;

        // Create transfer to the artist
        await stripe.transfers.create({
          amount: Number.parseInt(artistCut.toFixed(0)), // Amount in cents
          currency: "usd",
          source_transaction: paymentIntent.latest_charge,
          destination: artistId,
          description: `Payment for ${cart[i].q}x ${item.name} - $${(artistCutPerItem / 100).toFixed(2)} per`
        });
      }
      break;
    case "StripeCardError":
      console.log(`A payment error occurred.`);
      break;
    case "StripeInvalidRequestError":
      console.log("An invalid request occurred.");

      if (req.session.user) {
        const user = await User.findOne({
          checkoutSecret: paymentIntent.client_secret
        });

        console.log(user);

        if (user) {
          user.checkoutClientSecret = null;
          await user.save();
        }
      }

      console.log(req.session);
      req.session.cart = [];
      break;
    default:
      //Don't handle other event types
      break;
  }

  // Return a response to acknowledge receipt of the event
  return res.json({ received: true });
});
