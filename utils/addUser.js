require("dotenv").config();
const connectDB = require("../db/connect");

const UserModel = require("../models/User");
const CustomAPIError = require("../errors");

const addAdmin = async (adminInfo) => {
  await connectDB(process.env.MONGO_URI);

  const { name, email, password } = adminInfo;

  if (!name || !email || !password) {
    throw new CustomAPIError.BadRequestError("Please provide all details");
  }

  if (email.includes("+")) {
    throw new CustomAPIError.BadRequestError("Invalid email!");
  }

  const admin = await UserModel.create({
    name,
    email: email.toLowerCase(),
    password,
    role: "admin"
  });

  console.log("Admin created!", admin);
};

const addStudent = async (adminInfo) => {
  await connectDB(process.env.MONGO_URI);

  const { name, roll_no, password } = adminInfo;

  if (!name || !roll_no?.trim() || !password) {
    throw new CustomAPIError.BadRequestError("Please provide all details");
  }

  const date_of_birth = new Date(password);
  if (date_of_birth == "Invalid Date") {
    throw new CustomAPIError.BadRequestError("Invalid date of birth!");
  }

  const student = await UserModel.create({
    name,
    roll_no,
    password,
    role: "student"
  });

  console.log("Student created!", student);
};

// addAdmin({
//   name: "Admin",
//   email: "admin@gmail.com",
//   password: "secret_pass",
// });

// addStudent({
//   name: "Tushar",
//   roll_no: "2204220109038",
//   password: "2002-02-25",
// })
