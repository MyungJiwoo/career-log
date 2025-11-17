import mongoose from "mongoose";

const appliedJobSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      require: true,
      // unique: true,
    },
    companyName: {
      type: String,
      require: true,
      trim: true,
    },
    position: {
      type: String,
      require: true,
      trim: true,
    },
    appliedDate: {
      type: Date,
    },
    stages: [
      {
        order: {
          type: Number,
          required: true,
          min: 1,
        },
        name: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "pass", "nonpass"],
          default: "pending",
        },
      },
    ],
    contents: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: String,
      enum: ["in progress", "pending", "completed"],
      default: "in progress",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const AppliedJob = mongoose.model("AppliedJob", appliedJobSchema);

export default AppliedJob;
