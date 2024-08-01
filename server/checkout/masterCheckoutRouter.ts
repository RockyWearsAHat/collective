import { Router } from "express";
import { createCheckoutSessionRouter } from "./createCheckoutSession";
import { createPaymentIntentRouter } from "./createPaymentIntent";
import { getUserRouter } from "./getUser";
import { clearPaymentIntentsRouter } from "./clearPaymentIntents";
import { stripeWebhookRouter } from "./stripeWebhooks";
import { calculateTaxRouter } from "./calculateTax";
import { updatePaymentIntentRouter } from "./updatePaymentIntent";
import { writeCartIdToUserRouter } from "./writeCartIdToUser";
import { getCartIdFromUserRouter } from "./getCartIdFromUser";

export const masterCheckoutRouter: Router = Router();

masterCheckoutRouter.use("/createCheckoutSession", createCheckoutSessionRouter);
masterCheckoutRouter.use("/createPaymentIntent", createPaymentIntentRouter);
masterCheckoutRouter.use("/getUser", getUserRouter);
masterCheckoutRouter.use("/clearPaymentIntents", clearPaymentIntentsRouter);
masterCheckoutRouter.use("/stripeWebhooks", stripeWebhookRouter);
masterCheckoutRouter.use("/calculateTax", calculateTaxRouter);
masterCheckoutRouter.use("/updatePaymentIntent", updatePaymentIntentRouter);
masterCheckoutRouter.use("/writeCartIdToUser", writeCartIdToUserRouter);
masterCheckoutRouter.use("/getCartIdFromUser", getCartIdFromUserRouter);
