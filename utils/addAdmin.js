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
  });

  console.log("Admin created!", admin);
};

// addAdmin({
//   name: "Admin",
//   email: "admin@gmail.com",
//   password: "secret_pass",
//   role: "admin"
// });
