const mongoose = require('mongoose');
const validator = require('validator');

const JobApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'JobOpenings',
    },

    applicantId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'hired', 'rejected'],
      default: 'applied',
    },

    portfolio: {
      type: String,
      required: [true, 'Portfolio is required'],
      trim: true,
      validate: {
        validator: validator.isURL,
        message: 'Invalid portfolio URL!',
      },
    },

    coverLetter: {
      type: String,
      required: [true, 'Cover letter is required'],
    },

    resume: {
      type: String,
      required: [true, 'Resume is required'],
    },
  },
  { timestamps: true, versionKey: false }
);

JobApplicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });

const JobApplicationModel = mongoose.model(
  'JobApplication',
  JobApplicationSchema
);

module.exports = JobApplicationModel;
