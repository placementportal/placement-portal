const mongoose = require('mongoose');

const JobOpeningSchema = new mongoose.Schema(
  {
    profile: {
      type: String,
      required: [true, 'Job Profile is required'],
      trim: true,
      minlength: [3, 'Name should be of atleast 3 characters'],
      maxlength: [30, 'Name should be of maximum 30 characters'],
    },

    description: {
      type: String,
      required: [true, 'Job Description is required'],
      trim: true,
    },

    openingsCount: {
      type: Number,
      required: [true, 'Opening Count is required'],
      default: 1,
      min: 1,
    },

    location: {
      type: String,
      required: [true, 'Job Location is required'],
      trim: true,
    },

    company: {
      type: mongoose.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company is required!'],
    },

    jobPackage: {
      type: Number,
      required: [true, 'Job Package (in LPA) is required'],
    },

    keySkills: {
      type: [String],
      default: [],
    },

    deadline: {
      type: Date,
      required: [true, 'Job Application Deadline is required!'],
    },

    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },

    applicants: {
      type: [mongoose.Types.ObjectId],
      default: [],
      ref: 'User',
    },

    shortlistedCandidates: {
      type: [mongoose.Types.ObjectId],
      default: [],
      ref: 'User',
    },

    rejectedCandidates: {
      type: [mongoose.Types.ObjectId],
      default: [],
      ref: 'User',
    },

    selectedCandidates: {
      type: [mongoose.Types.ObjectId],
      default: [],
      ref: 'User',
    },

    applications: {
      type: [mongoose.Types.ObjectId],
      default: [],
      ref: 'JobApplication',
    },

    receivingCourse: {
      type: mongoose.Types.ObjectId,
      ref: 'Course',
      required: true,
    },

    receivingBatches: {
      type: [mongoose.Types.ObjectId],
      ref: 'Batch',
      required: true,
    },

    receivingDepartments: {
      type: [mongoose.Types.ObjectId],
      ref: 'Department',
      required: true,
    },

    postedBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const JobOpeningModel = mongoose.model('JobOpening', JobOpeningSchema);

module.exports = JobOpeningModel;
