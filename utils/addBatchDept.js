require("dotenv").config();
const connectDB = require("../db/connect");

const BatchModel = require("../models/Batch");
const DepartmentModel = require("../models/Department");

const addBatch = async (batchName) => {
  await connectDB(process.env.MONGO_URI);
  try {
    const batch = await BatchModel.create({ batchName });
    console.log(`Batch created with id: ${batch._id}`);
  } catch (error) {
    console.log("Failed to create batch", error);
  }
};

const addDepartment = async (departmentName, batchId) => {
  await connectDB(process.env.MONGO_URI);
  try {
    const batch = await BatchModel.findById(batchId);
    if (!batch) {
      throw new Error(`No batch found with id: ${batchId}`);
    }
    const department = await DepartmentModel.create({
      departmentName,
      batchId,
    });

    batch.departments.push(department._id);
    await batch.save();

    console.log(`Department created with id: ${department._id}`);
  } catch (error) {
    console.log("Failed to create department", error);
  }
};

// addBatch("B. Tech. 2025");
// addDepartment("Computer Science & Engineering", "64a4454533321b659efc386d");
