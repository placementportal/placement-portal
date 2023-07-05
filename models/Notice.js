const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema(
  {
    noticeTitle: {
      type: String,
      trim: true,
      required: [true, "Notice Title is required"],
    },

    noticeBody: {
      type: String,
      trim: true,
      required: [true, "Notice Body is required"],
    },

    noticeFile: {
      type: String,
      trim: true,
      required: [true, "Notice File is required"],
    },

    receivingCourse: {
      type: mongoose.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    receivingBatches: {
      type: [mongoose.Types.ObjectId],
      ref: "Batch",
      required: true,
    },

    receivingDepartments: {
      type: [mongoose.Types.ObjectId],
      ref: "Department",
      required: true,
    },

    createdBy: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

const NoticeModel = mongoose.model("Notice", NoticeSchema);

module.exports = NoticeModel;
