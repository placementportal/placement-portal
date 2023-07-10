const UserModel = require("../models/User");

const CustomAPIError = require("../errors");
const { StatusCodes } = require("http-status-codes");

const getStudents = async (req, res) => {
  const page = req?.query?.page || 1;
  const limit = req?.query?.limit || 15;
  const course = req?.query?.course;
  const batch = req?.query?.batch;
  const dept = req?.query?.dept;

  const skip = (page - 1) * limit;

  const query = { role: "student" };

  if (course)
    query['courseId'] = course;
  
  if (batch)
    query['batchId'] = { $in: batch.split("|") };

  if (dept)
    query['departmentId'] = { $in: dept.split("|") };

  const studentsCount = await UserModel.countDocuments(query);
  const totalPages = Math.ceil(studentsCount / limit);

  if (totalPages < page)
    throw new CustomAPIError.BadRequestError(`Invalid page no ${page}`);

  const students = await UserModel.find(query)
    .select("name courseId batchId departmentId")
    .populate({
      path: "courseId",
      select: "courseName",
    })
    .populate({
      path: "batchId",
      select: "batchYear",
    })
    .populate({
      path: "departmentId",
      select: "departmentName",
    })
    .sort("roll_no")
    .skip(skip)
    .limit(limit);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Found students",
    students,
    page,
    limit,
    totalPages,
  });
};

module.exports = {
  getStudents,
};
