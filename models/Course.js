const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      trim: true,
      required: [true, "Course Name is required!"],
      unique: [true, "Course Name must be unique!"],
    },

    batches: {
      type: [mongoose.Types.ObjectId],
      ref: "Batch",
      default: [],
    },

    departments: {
      type: [mongoose.Types.ObjectId],
      ref: "Department",
      default: [],
    },

    lastNoticeTime: {
      type: Date,
      default: new Date(),
    },
  },
  { versionKey: false, timestamps: true }
);

const BatchSchema = new mongoose.Schema(
  {
    batchYear: {
      type: Number,
      trim: true,
      required: [true, "Batch Year is required!"],
    },

    courseId: {
      type: mongoose.Types.ObjectId,
      ref: "Course",
      required: [true, "Course Id is required!"],
    },

    lastNoticeTime: {
      type: Date,
      default: new Date(),
    },
  },
  { versionKey: false, timestamps: true }
);

BatchSchema.index({ courseId: 1, batchYear: 1 }, { unique: true });

const DepartmentSchema = new mongoose.Schema(
  {
    departmentName: {
      type: String,
      trim: true,
      required: [true, "Department name is required!"],
    },

    departmentCode: {
      type: String,
      trim: true,
      required: [true, "Department Code is required!"],
    },

    courseId: {
      type: mongoose.Types.ObjectId,
      required: [true, "Course Id is required!"],
      ref: "Course",
    },

    lastNoticeTime: {
      type: Date,
      default: new Date(),
    },
  },
  { versionKey: false, timestamps: true }
);

DepartmentSchema.index({ courseId: 1, departmentName: 1 }, { unique: true });
DepartmentSchema.index({ courseId: 1, departmentCode: 1 }, { unique: true });

const CourseModel = mongoose.model("Course", CourseSchema);
const BatchModel = mongoose.model("Batch", BatchSchema);
const DepartmentModel = mongoose.model("Department", DepartmentSchema);

module.exports = { CourseModel, BatchModel, DepartmentModel };
