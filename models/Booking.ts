import mongoose, { Schema, Document, Model } from "mongoose";

export type BookingSource =
  | "WEBSITE"
  | "AIRBNB"
  | "BOOKING_COM"
  | "PHONE"
  | "WHATSAPP"
  | "ADMIN";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export type PaymentStatus =
  | "UNPAID"
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export type EmailStatus = "NOT_SENT" | "SENT" | "FAILED";

export interface IBooking extends Document {
  villaId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalAmount: number;
  source: BookingSource;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  confirmationEmailStatus: EmailStatus;
  confirmationEmailSentAt?: Date;
  externalBookingId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentHoldExpiresAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    villaId: {
      type: Schema.Types.ObjectId,
      ref: "Villa",
      required: [true, "Villa ID is required"],
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    guestName: {
      type: String,
      required: [true, "Guest name is required"],
      trim: true,
    },
    guestEmail: {
      type: String,
      required: [true, "Guest email is required"],
      trim: true,
      lowercase: true,
    },
    guestPhone: {
      type: String,
      required: [true, "Guest phone is required"],
      trim: true,
    },
    checkIn: {
      type: Date,
      required: [true, "Check-in date is required"],
      index: true,
    },
    checkOut: {
      type: Date,
      required: [true, "Check-out date is required"],
      index: true,
    },
    guests: {
      type: Number,
      required: [true, "Number of guests is required"],
      min: [1, "Guests must be at least 1"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    source: {
      type: String,
      enum: ["WEBSITE", "AIRBNB", "BOOKING_COM", "PHONE", "WHATSAPP", "ADMIN"],
      default: "WEBSITE",
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
      default: "PENDING",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "UNPAID",
    },
    confirmationEmailStatus: {
      type: String,
      enum: ["NOT_SENT", "SENT", "FAILED"],
      default: "NOT_SENT",
      index: true,
    },
    confirmationEmailSentAt: {
      type: Date,
      required: false,
    },
    externalBookingId: {
      type: String,
      default: "",
      trim: true,
    },
    razorpayOrderId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: "",
      trim: true,
    },
    paymentHoldExpiresAt: {
      type: Date,
      required: false,
      index: true,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for high-performance date range overlap queries
BookingSchema.index({ villaId: 1, status: 1, checkIn: 1, checkOut: 1 });

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
