import { Request, Response, Router } from "express";
import Stripe from "stripe";

export const createCheckoutSessionRouter: Router = Router();

createCheckoutSessionRouter.post("/", async (req: Request, res: Response) => {
  if (!process.env.STRIPE_SECRET_KEY)
    return res.json({ error: "No stripe key found" });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const { items } = req.body;

  console.log(items);

  try {
    if (!items || items.length == 0)
      return res.json({ error: "No items in cart" });

    let lineItems: Array<Object> = [];

    for (let i = 0; i < items.length; i++) {
      const saleDescription = items[i].salePrice
        ? "Was " + items[i].price + ", now just " + items[i].salePrice
        : null;
      console.log(saleDescription);
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: items[i].name,
            images: [
              "https://images.pexels.com/photos/26775381/pexels-photo-26775381/free-photo-of-black-and-white-photograph-of-sand-dunes-in-the-desert.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              // "https://artist-collective.s3.us-west-2.amazonaws.com/664269fa89b3ce1870599c6b/1720605749355-IMG_4021.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAYS2NTINYAJ4LBNTE%2F20240722%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240722T001904Z&X-Amz-Expires=7200&X-Amz-Signature=ecfdcae6cac5206ba818f4a5b13f992337b681b0cb9a8ba995ce4e7c3322c91c&X-Amz-SignedHeaders=host&x-id=GetObject"
            ]
          },
          unit_amount:
            Number.parseFloat(
              (items[i].salePrice
                ? items[i].salePrice
                : items[i].price
              ).substring(1)
            ) * 100
        },
        quantity: items[i].quantity
      });

      if (saleDescription) {
        (lineItems[i] as any).price_data!.product_data!.description! =
          saleDescription;
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `http://localhost:4000/`,
      cancel_url: `http://localhost:4000/cart`,
      automatic_tax: { enabled: true }
    });

    console.log(session);

    if (!session.url)
      return res.json({
        error: "An error occurred creating the checkout page"
      });

    return res.json({ url: session.url });
  } catch (err) {
    console.log(err);
    return res.json({ error: "An error occurred" });
  }
});
