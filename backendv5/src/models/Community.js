import mongoose from "mongoose";

const { Schema } = mongoose;

const communitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    cityOrVillage: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    memberCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export const Community = mongoose.model("Community", communitySchema);

