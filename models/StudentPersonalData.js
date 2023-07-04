const mongoose = require("mongoose");
const validator = require("validator");

const StudentPersonalDataSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Types.ObjectId,
      required: true,
      unique: true,
      ref: "User",
    },

    fatherName: {
      type: String,
      required: [true, "Father's Name is required"],
      trim: true,
      minlength: [3, "Father's Name should be of atleast 3 characters"],
      maxlength: [30, "Father's Name should be of maximum 30 characters"],
    },

    motherName: {
      type: String,
      required: [true, "Mother's Name is required"],
      trim: true,
      minlength: [3, "Mother's Name should be of atleast 3 characters"],
      maxlength: [30, "Mother's Name should be of maximum 30 characters"],
    },

    contactNumber: {
      type: String,
      required: [true, "Contact Number is required"],
      trim: true,
      unique: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "User already exists"],
      validate: {
        validator: validator.isEmail,
        message: "Please enter a valid email",
      },
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

    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const StudentPersonalDataModel = mongoose.model(
  "StudentPersonalData",
  StudentPersonalDataSchema
);

module.exports = StudentPersonalDataModel;
