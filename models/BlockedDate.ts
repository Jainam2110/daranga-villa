import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlockedDate extends Document {
  villaId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  reason?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BlockedDateSchema = new Schema<IBlockedDate>(
  {
    villaId: {
      type: Schema.Types.ObjectId,
      ref: "Villa",
      required: [true, "Villa ID is required"],
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      index: true,
    },
    reason: {
      type: String,
      default: "Maintenance / Owner Hold",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast date range queries
BlockedDateSchema.index({ villaId: 1, startDate: 1, endDate: 1 });

const BlockedDate: Model<IBlockedDate> =
  mongoose.models.BlockedDate ||
  mongoose.model<IBlockedDate>("BlockedDate", BlockedDateSchema);

export default BlockedDate;
