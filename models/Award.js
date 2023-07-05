const mongoose = require("mongoose");

const AwardSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },

    awardName: {
      type: String,
      trim: true,
      required: [true, "Award Name is required!"],
    },

    organisation: {
      type: String,
      trim: true,
      required: [true, "Organisation is required!"],
    },

    description: {
      type: String,
      trim: true,
      required: [true, "Award Description is required!"],
    },
  },
  { versionKey: false, timestamps: true }
);

const AwardModel = mongoose.model("Award", AwardSchema);

module.exports = AwardModel;
