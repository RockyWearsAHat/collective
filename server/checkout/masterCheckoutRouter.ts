import { Router } from "express";
import { createCheckoutSessionRouter } from "./createCheckoutSession";
import { createPaymentIntentRouter } from "./createPaymentIntent";
import { getUserRouter } from "./getUser";
import { clearPaymentIntentsRouter } from "./clearPaymentIntents";
import { stripeWebhookRouter } from "./stripeWebhooks";
import { calculateTaxRouter } from "./calculateTax";
import { updatePaymentIntentRouter } from "./updatePaymentIntent";
import { writeCheckoutSecretToUserRouter } from "./writeCheckoutSecretToUser";
import { getCheckoutSecretFromUserRouter } from "./getCheckoutSecretFromUser";
import { getBalanceOfAccountRouter } from "./getBalanceOfAccount";

export const masterCheckoutRouter: Router = Router();

masterCheckoutRouter.use("/createCheckoutSession", createCheckoutSessionRouter);
masterCheckoutRouter.use("/createPaymentIntent", createPaymentIntentRouter);
masterCheckoutRouter.use("/getUser", getUserRouter);
masterCheckoutRouter.use("/clearPaymentIntents", clearPaymentIntentsRouter);
masterCheckoutRouter.use("/stripeWebhooks", stripeWebhookRouter);
masterCheckoutRouter.use("/calculateTax", calculateTaxRouter);
masterCheckoutRouter.use("/updatePaymentIntent", updatePaymentIntentRouter);
masterCheckoutRouter.use(
  "/writeCheckoutSecretToUser",
  writeCheckoutSecretToUserRouter
);
masterCheckoutRouter.use(
  "/getCheckoutSecretFromUser",
  getCheckoutSecretFromUserRouter
);
masterCheckoutRouter.use("/getBalanceOfAccount", getBalanceOfAccountRouter);
