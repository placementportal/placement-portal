const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name should be of atleast 3 characters"],
      maxlength: [30, "Name should be of maximum 30 characters"],
    },

    email: {
      type: String,
      // required: [true, "Email is required"],
      unique: [true, "User already exists"],
      validate: {
        validator: validator.isEmail,
        message: "Please enter a valid email",
      },
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password should be of atleast 8 characters"],
    },

    role: {
      type: String,
      default: "student",
    },

    // student specific fields

    roll_no: {
      type: String,
    },

    batchId: {
      type: mongoose.Types.ObjectId,
      ref: "Batch"
    },

    departmentId: {
      type: mongoose.Types.ObjectId,
      ref: "Department",
    },

    personal_details: {
      type: mongoose.Types.ObjectId,
      unique: true,
    },

    education_details: {
      type: mongoose.Types.ObjectId,
      unique: true,
    },
  },
  { timestamps: true, versionKey: false }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
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

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
