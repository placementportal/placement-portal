const mongoose = require("mongoose");

const ExperienceDataSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
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
  { versionKey: false, timestamps: true, collection: "StudentExperienceData" }
);

const PlacementDataSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
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

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },

    package: {
      type: Number,
      required: [true, "Package Amount is required"],
    },

    offerLetter: {
      type: String,
    },

    joiningLetter: {
      type: String,
    },

    joiningDate: {
      type: Date,
    },
  },
  { versionKey: false, timestamps: true, collection: "StudentPlacementData" }
);

const StudentJobDataSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Types.ObjectId,
      required: true,
      unique: true,
      ref: "User",
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
  { versionKey: false, timestamps: true, collection: "StudentJobData" }
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
