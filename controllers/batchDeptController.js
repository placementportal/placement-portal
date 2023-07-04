const BatchModel = require("../models/Batch");
const DepartmentModel = require("../models/Department");

const CustomAPIError = require("../errors");
const { StatusCodes } = require("http-status-codes");

const createBatch = async (req, res) => {
  const { batchName } = req.body;
  const batch = await BatchModel.create({ batchName });
  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Batch created!",
    id: batch._id,
  });
};

const createDepartment = async (req, res) => {
  const { departmentName } = req.body;
  const { batchId } = req.params;

  if (!batchId?.trim()) {
    throw new CustomAPIError.BadRequestError("Batch Id is required!");
  }

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

  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Department created!",
    id: department._id,
  });
};

const getAllBatches = async (req, res) => {
  const batches = await BatchModel.find().select("batchName");
  res.status(StatusCodes.OK).json({
    success: true,
    batches,
  });
};

const getDepartments = async (req, res) => {
  const batchId = req.params?.batchId;

  if (!batchId) {
    throw new CustomAPIError.BadRequestError("Batch Id is required");
  }

  let departments;

  if (batchId == "all") {
    departments = await DepartmentModel.find();
  } else {
    const batch = await BatchModel.findById(batchId);
    if (!batch) {
      throw new CustomAPIError.BadRequestError(
        `No batch found with id: ${batchId}`
      );
    }
    departments = await DepartmentModel.find({ batchId }).select(
      "departmentName batchId"
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    departments,
  });
};

module.exports = {
  createBatch,
  createDepartment,
  getAllBatches,
  getDepartments,
};
