const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [3, 'Name should be of atleast 3 characters'],
      maxlength: [30, 'Name should be of maximum 30 characters'],
    },

    photo: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: [true, 'User already exists'],
      validate: {
        validator: validator.isEmail,
        message: 'Please enter a valid email',
      },
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password should be of atleast 8 characters'],
    },

    role: {
      type: String,
      enum: ['student', 'admin', 'company_admin'],
      default: 'student',
    },

    // student specific fields

    roll_no: {
      type: String,
      index: {
        unique: true,
        partialFilterExpression: { roll_no: { $type: 'string' } },
      },
    },

    courseId: {
      type: mongoose.Types.ObjectId,
      ref: 'Course',
    },

    batchId: {
      type: mongoose.Types.ObjectId,
      ref: 'Batch',
    },

    departmentId: {
      type: mongoose.Types.ObjectId,
      ref: 'Department',
    },

    personal_details: {
      type: mongoose.Types.ObjectId,
      ref: 'StudentPersonalData',
      index: {
        unique: true,
        partialFilterExpression: { personal_details: { $type: 'objectId' } },
      },
    },

    education_details: {
      type: mongoose.Types.ObjectId,
      ref: 'StudentEducationData',
      index: {
        unique: true,
        partialFilterExpression: { education_details: { $type: 'objectId' } },
      },
    },

    lastNoticeFetched: {
      type: Date,
      default: new Date(),
    },

    // student jobs

    jobsApplied: {
      type: [mongoose.Types.ObjectId],
      default: [],
      ref: 'JobOpenings',
    },

    jobsSelected: {
      type: [mongoose.Types.ObjectId],
      default: [],
      ref: 'JobOpenings',
    },

    jobsRejected: {
      type: [mongoose.Types.ObjectId],
      default: [],
      ref: 'JobOpenings',
    },

    jobsShortlisted: {
      type: [mongoose.Types.ObjectId],
      default: [],
      ref: 'JobOpenings',
    },

    jobApplications: {
      type: [mongoose.Types.ObjectId],
      default: [],
      ref: 'JobApplications',
    },

    lastJobFetched: {
      type: Date,
      default: new Date(),
    },

    // company id specific fields
    companyId: {
      type: mongoose.Types.ObjectId,
      ref: 'Company',
    },

    companyRole: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true, versionKey: false }
);

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isPasswordCorrect = await bcrypt.compare(
    candidatePassword,
    this.password
  );
  return isPasswordCorrect;
};

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
