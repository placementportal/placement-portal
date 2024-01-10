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

    rollNo: {
      type: String,
      index: {
        unique: true,
        partialFilterExpression: { roll_no: { $type: 'string' } },
      },
    },

    isLateralEntry: {
      type: Boolean,
      default: false,
    },

    courseId: {
      type: mongoose.Types.ObjectId,
      ref: 'Course',
    },

    courseName: {
      type: String,
    },

    courseLevel: {
      type: String,
      enum: ['graduation', 'PG'],
      default: 'graduation',
    },

    yearsCount: {
      type: Number,
      min: 2,
      max: 4,
    },

    semestersCount: {
      type: Number,
      min: 4,
      max: 8,
    },

    batchId: {
      type: mongoose.Types.ObjectId,
      ref: 'Batch',
    },

    batchYear: {
      type: Number,
    },

    departmentId: {
      type: mongoose.Types.ObjectId,
      ref: 'Department',
    },

    departmentName: {
      type: String,
    },

    personalDetails: {
      type: mongoose.Types.ObjectId,
      ref: 'StudentPersonalData',
      index: {
        unique: true,
        partialFilterExpression: { personalDetails: { $type: 'objectId' } },
      },
    },

    educationDetails: {
      type: mongoose.Types.ObjectId,
      ref: 'StudentEducationData',
      index: {
        unique: true,
        partialFilterExpression: { educationDetails: { $type: 'objectId' } },
      },
    },

    placements: {
      type: [mongoose.Types.ObjectId],
      ref: 'StudentPlacementData',
      index: {
        unique: true,
        partialFilterExpression: { placements: { $type: 'objectId' } },
      },
    },

    experiences: {
      type: [mongoose.Types.ObjectId],
      ref: 'StudentExperiences',
      index: {
        unique: true,
        partialFilterExpression: { experiences: { $type: 'objectId' } },
      },
    },

    trainings: {
      type: [mongoose.Types.ObjectId],
      ref: 'StudentTrainings',
      index: {
        unique: true,
        partialFilterExpression: { trainings: { $type: 'objectId' } },
      },
    },

    skills: {
      type: [String],
    },

    achievements: {
      type: [String],
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
