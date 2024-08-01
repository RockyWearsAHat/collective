import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function calculateTax(
  amount: number,
  address: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  }
): Promise<any> {
  try {
    const taxCalculation = await stripe.tax.calculations.create({
      currency: "usd",
      line_items: [
        {
          amount: amount,
          reference: "unique_line_item_id",
          tax_behavior: "exclusive"
        }
      ],
      customer_details: {
        address: {
          line1: address.line1,
          city: address.city,
          state: address.state,
          postal_code: address.postal_code,
          country: address.country
        },
        address_source: "shipping"
      }
    });

    return taxCalculation;
  } catch (error) {
    console.error("Error calculating tax:", error);
    return 0;
  }
}

import { Router, Request, Response } from "express";

export const calculateTaxRouter = Router();

calculateTaxRouter.post("/", async (req: Request, res: Response) => {
  const { amount, addressValue } = req.body;
  const { address } = addressValue;
  if (!amount || !address) {
    return res.json({
      error:
        "There was an error calculating the tax, no amount or address provided."
    });
  }
  const tax = await calculateTax(amount, address);
  return res.json({ tax, address: addressValue });
});
