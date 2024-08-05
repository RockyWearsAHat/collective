import { User, IUser } from "../../db/models/user";
import { Request, Response, Router } from "express";
import { checkIfEmail } from "../../helpers/checkIfEmail";
import Stripe from "stripe";

export const registerRouter = Router();

const numberOfPfps = 5;

registerRouter.post("/", async (req: Request, res: Response) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY)
      return res.json({ error: "No stripe key found" });
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { username, email, password }: Partial<IUser> = req.body;
    const { isArtist } = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      typeof email !== "string"
    )
      return res.json({
        error: "Username, email and password must be strings"
      });

    if (
      !username ||
      !password ||
      !email ||
      username.length == 0 ||
      password.length == 0 ||
      email.length == 0
    )
      return res.json({
        error: "Username, email and password must not be empty"
      });

    if (!checkIfEmail(email)) return res.json({ error: "Invalid email" });

    let userExists = await User.findOne({ email });
    if (userExists)
      return res.json({
        error: `A user with the email ${email} already exists`
      });
    userExists = await User.findOne({ username });
    if (userExists)
      return res.json({
        error: `A user with the username ${username} already exists`
      });

    const pfpId = Math.floor(Math.random() * numberOfPfps) + 1;

    let userInfo: {
      username: string;
      email: string;
      password: string;
      pfpId: number | string;
      isArtist: boolean;
      stripeId?: string;
      onboardingComplete: boolean;
      stripeCustomerId: string;
    } = {
      username,
      email,
      password,
      pfpId,
      isArtist: isArtist ? true : false,
      onboardingComplete: false,
      stripeCustomerId: ""
    };

    let stripeAccount: Stripe.Account;

    if (isArtist) {
      stripeAccount = await stripe.accounts.create({
        controller: {
          stripe_dashboard: {
            type: "none"
          },
          fees: {
            payer: "application"
          },
          losses: {
            payments: "application"
          },
          requirement_collection: "application"
        },
        capabilities: {
          transfers: { requested: true }
        },
        country: "US",
        business_type: "individual",
        business_profile: {
          url: `https://www.artistcollective.store/${username}`
        }
      });

      if (!stripeAccount.id)
        return res.json({ error: "Error creating stripe account" });

      userInfo.stripeId = stripeAccount.id;
    }

    const stripeCustomer = await stripe.customers.create({
      email: email
    });

    userInfo.stripeCustomerId = stripeCustomer.id;

    console.log(userInfo);

    const newUser = await User.create(userInfo);

    return res.json({
      registerRes: newUser
    });
  } catch (err) {
    return res.json({ error: `Error creating user ${err}` });
  }
});
