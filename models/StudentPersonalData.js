const mongoose = require("mongoose");

const StudentPersonalDataSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Types.ObjectId,
      required: true,
      unique: true,
    },

    father_name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name should be of atleast 3 characters"],
      maxlength: [30, "Name should be of maximum 30 characters"],
    },

    contact_number: {
      type: String,
      required: [true, "Contact Number is required"],
      trim: true,
    },

    father_contact_number: {
      type: String,
      required: [true, "Father's Contact Number is required"],
      trim: true,
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },

    district: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },

    hobbies: {
      type: [String],
    },
  },
  { timestamps: true, versionKey: false }
);

const StudentPersonalDataModel = mongoose.model(
  "StudentPersonalData",
  StudentPersonalDataSchema
);

module.exports = StudentPersonalDataModel;
