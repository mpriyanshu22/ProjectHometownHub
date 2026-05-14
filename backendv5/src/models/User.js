import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    hometown: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["User", "Admin", "Moderator"],
      default: "User",
    },
    joinedCommunities: [
      {
        type: Schema.Types.ObjectId,
        ref: "Community",
      },
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);

