const mongoose = require("mongoose");

const ExperienceDataSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Types.ObjectId,
      required: true,
    },

    jobProfile: {
      type: String,
      required: [true, "Job Profile is required"],
      trim: true,
    },

    company: {
      type: String,
      required: [true, "Employer company is required"],
      trim: true,
    },

    startDate: {
      type: Date,
      required: [true, "Job start date is required"],
    },

    endDate: {
      type: Date,
    },
  },
  { versionKey: false }
);

const PlacementDataSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Types.ObjectId,
      required: true,
    },

    jobProfile: {
      type: String,
      required: [true, "Job Profile is required"],
      trim: true,
    },

    company: {
      type: String,
      required: [true, "Employer company is required"],
      trim: true,
    },

    package: {
      type: Number,
      required: [true, "Package is required"],
    },

    offerLetter: {
      type: String,
    },

    appointmentLetter: {
      type: String,
    },

    salarySlip: {
      type: String,
    },
  },
  { versionKey: false }
);

const StudentJobDataSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Types.ObjectId,
      required: true,
      unique: true,
    },

    placements: {
      type: [mongoose.Types.ObjectId],
      default: [],
    },

    experiences: {
      type: [mongoose.Types.ObjectId],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

const StudentPlacementDataModel = mongoose.model(
  "StudentPlacementData",
  PlacementDataSchema
);

const StudentExperienceDataModel = mongoose.model(
  "StudentExperienceData",
  ExperienceDataSchema
);

const StudentJobDataModel = mongoose.model(
  "StudentJobData",
  StudentJobDataSchema
);

module.exports = {
  StudentExperienceDataModel,
  StudentPlacementDataModel,
  StudentJobDataModel,
};
