const mongoose = require("mongoose");

const BatchSchema = new mongoose.Schema({
  batchName: {
    type: String,
    unique: true,
    trim: true,
    required: [true, "Batch name is required!"],
  },

  departments: {
    type: [mongoose.Types.ObjectId],
    ref: "Department",
    default: [],
  },

  lastNoticeTime: {
    type: Date
  },
});

const BatchModel = mongoose.model("Batch", BatchSchema);

module.exports = BatchModel;
