const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
  departmentName: {
    type: String,
    trim: true,
    required: [true, "Department name is required!"],
  },

  batchId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Batch",
  },

  lastNoticeTime: {
    type: Date
  },

});

DepartmentSchema.index(
  { batchId: 1, departmentName: 1 },
  { unique: true }
);

const DepartmentModel = mongoose.model("Department", DepartmentSchema);

module.exports = DepartmentModel;
