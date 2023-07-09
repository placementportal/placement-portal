const mongoose = require("mongoose");

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
      maxlength: [50, "Father's Name should be of maximum 50 characters"],
    },

    motherName: {
      type: String,
      // required: [true, "Mother's Name is required"],
      trim: true,
      minlength: [3, "Mother's Name should be of atleast 3 characters"],
      maxlength: [50, "Mother's Name should be of maximum 50 characters"],
    },

    contactNumber: {
      type: String,
      // required: [true, "Contact Number is required"],
      trim: true,
      index: {
        unique: true,
        partialFilterExpression: { contactNumber: {$type: "string"} }
      }
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
      // required: [true, "State is required"],
      trim: true,
    },
  },
  { versionKey: false, timestamps: true, collection: "StudentPersonalData" }
);

const StudentPersonalDataModel = mongoose.model(
  "StudentPersonalData",
  StudentPersonalDataSchema
);

module.exports = StudentPersonalDataModel;
