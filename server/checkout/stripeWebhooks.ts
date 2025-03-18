import { Router, Request, Response } from "express";
import { Item } from "../../db/models/item";
import { User } from "../../db/models/user";
import Stripe from "stripe";
import { sendEmail } from "../emails/sendEmail";
import ReactDOMServer from "react-dom/server";
import { OrderEmail } from "../../emails/OrderEmail";

//In percent, 0-100
const artistCollectiveCut = 80;

export const stripeWebhookRouter = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

stripeWebhookRouter.post("/", async (req: Request, res: Response) => {
  const event = req.body;

  console.log(event);

  switch (event.type) {
    //On success
    case "payment_intent.succeeded":
      console.log("payment intent success");
      const paymentIntent = event.data.object;

      const user = await User.findOne({
        checkoutSecret: paymentIntent.client_secret
      });

      console.log(user);

      if (user) {
        user.checkoutClientSecret = null;
        await user.save();
      }

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

      let cartItems = [];

      //Calculate artist cut
      for (let i = 0; i < cart.length; i++) {
        if (!cart[i].q) {
          cart[i].q = 1;
        }

        let item = await Item.findById(cart[i].i).populate("userCreatedId", "stripeId");
        if (!item) continue; //Should never hit but ts errors??

        console.log(item);
        item.timesPurchased =
          Number.isNaN(item.timesPurchased) || item.timesPurchased == null ? 0 : item.timesPurchased;
        await item.save();

        console.log(item, cart);

        item = await Item.findById(cart[i].i).populate("userCreatedId", "stripeId");
        if (!item) continue; //Should never hit because item must exist for it to be purchased, but ts errors??

        item.timesPurchased = item.timesPurchased ? item.timesPurchased + cart[i].q : cart[i].q;
        await item.save();

        console.log(item);

        cartItems.push({ item, quantity: cart[i].q });

        if (!item) continue;
        const artistCut =
          Number.parseFloat(item.salePrice ? item.salePrice.toString() : item.price.toString()) *
          Number.parseInt(cart[i].q) *
          (100 - artistCollectiveCut);

        const artistId = (item.userCreatedId as any).stripeId;

        // Create transfer to the artist
        await stripe.transfers.create({
          amount: Number.parseInt(artistCut.toFixed(0)), // Amount in cents
          currency: "usd",
          source_transaction: paymentIntent.latest_charge,
          destination: artistId,
          description: `Payment for ${cart[i].q}x ${item.name} - $${item.salePrice ? item.salePrice : item.price} per`
        });
      }

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
