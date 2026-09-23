import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPaymentWebhookEvent extends Document {
  eventId: string;
  eventType: string;
  processedAt: Date;
}

const PaymentWebhookEventSchema = new Schema<IPaymentWebhookEvent>(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    eventType: {
      type: String,
      required: true,
      trim: true,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const PaymentWebhookEvent: Model<IPaymentWebhookEvent> =
  mongoose.models.PaymentWebhookEvent ||
  mongoose.model<IPaymentWebhookEvent>("PaymentWebhookEvent", PaymentWebhookEventSchema);

export default PaymentWebhookEvent;
