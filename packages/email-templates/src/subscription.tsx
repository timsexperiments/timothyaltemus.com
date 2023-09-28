import { render } from "@react-email/components";
import React from "react";
import SubscriptionEmail from "./emails/subscription";

const SUBJECT = "🚀 Tim's Experiments Launch Coming Soon!" as const;

export const subscriptionEmail = (email: string) => ({
  subject: SUBJECT,
  html: render(<SubscriptionEmail email={email} />, { pretty: true }),
  text: render(<SubscriptionEmail email={email} />, { plainText: true }),
});
