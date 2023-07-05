const mongoose = require("mongoose");

const StudentEducationDataSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Types.ObjectId,
      required: true,
      unique: true,
      ref: "User",
    },

    is_lateral_entry: {
      type: Boolean,
      default: false,
    },

    highschool_year: {
      type: Number,
      required: [true, "Highschool passing year is required!"],
    },

    highschool_score: {
      type: Number,
      min: 0,
      max: 100,
      required: [true, "Highschool score is required!"],
    },

    highschool_board: {
      type: String,
      required: [true, "Highschool baord is required!"],
      trim: true,
    },

    intermediate_year: {
      type: Number,
    },

    intermediate_score: {
      type: Number,
      min: 0,
      max: 100,
    },

    intermediate_board: {
      type: String,
      trim: true,
    },

    diploma_year: {
      type: Number,
    },

    diploma_score: {
      type: Number,
      min: 0,
      max: 100,
    },

    diploma_board: {
      type: String,
      trim: true,
    },

    btech_scores: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

const StudentEducationDataModel = mongoose.model(
  "StudentEducationData",
  StudentEducationDataSchema
);

module.exports = StudentEducationDataModel;
