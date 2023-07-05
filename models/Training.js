const mongoose = require("mongoose");

const TrainingSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },

    trainingName: {
      type: String,
      trim: true,
      required: [true, "Training Name is required!"],
    },

    organisation: {
      type: String,
      trim: true,
      required: [true, "Training Organisation is required!"],
    },

    startDate: {
      type: Date,
      required: [true, "Training Start Date is required!"],
    },

    endDate: {
      type: Date,
    },
  },
  { versionKey: false, timestamps: true }
);

const TrainingModel = mongoose.model("Training", TrainingSchema);

module.exports = TrainingModel;
