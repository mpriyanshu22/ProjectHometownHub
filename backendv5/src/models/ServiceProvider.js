import mongoose from "mongoose";

const { Schema } = mongoose;

const serviceProviderSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    specialization: [
      {
        type: String,
        trim: true,
      },
    ],
    community: {
      type: Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    number: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    owner: { 
      type: Schema.Types.ObjectId,
       ref: "User",
        required: true 
      },
    onboardingStatus: {
      type: String,
      enum: ["Pending", "Approved"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export const ServiceProvider = mongoose.model(
  "ServiceProvider",
  serviceProviderSchema
);

