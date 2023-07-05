const {
  CourseModel,
  DepartmentModel,
  BatchModel,
} = require("../models/Course");

const CustomAPIError = require("../errors");
const { StatusCodes } = require("http-status-codes");

const createCourse = async (req, res) => {
  const { courseName } = req.body;
  const course = await CourseModel.create({ courseName });
  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Course Created!",
    id: course._id,
  });
};

const getAllCourses = async (req, res) => {
  const courses = await CourseModel.find();
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Found all courses!",
    id: courses,
  });
};

const createBatch = async (req, res) => {
  const { batchYear, courseId } = req.body;

  if (!courseId?.trim()) {
    throw new CustomAPIError.BadRequestError("Course Id is required!");
  }

  const course = await CourseModel.findById(courseId);
  if (!course) {
    throw new CustomAPIError.BadRequestError(
      `No course found with id: ${courseId}`
    );
  }

  const batch = await BatchModel.create({ batchYear, courseId });

  course.batches.push(batch._id);
  await course.save();

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Batch created!",
    id: batch._id,
  });
};

const getBatches = async (req, res) => {
  const courseId = req?.query?.courseId;

  if (!courseId?.trim()) {
    throw new CustomAPIError.BadRequestError("Course Id is required!");
  }

  const course = await CourseModel.findById(courseId);
  if (!course) {
    throw new CustomAPIError.NotFoundError(
      `Course with id: ${courseId} doesn't exist!`
    );
  }

  const batches = await BatchModel.find({ courseId });
  res.status(StatusCodes.OK).json({
    success: true,
    message: `Found batches for course id: ${courseId}`,
    batches,
  });
};

const createDepartment = async (req, res) => {
  const { departmentName, courseId } = req.body;

  if (!courseId?.trim()) {
    throw new CustomAPIError.BadRequestError("Course Id is required!");
  }

  const course = await CourseModel.findById(courseId);
  if (!course) {
    throw new CustomAPIError.BadRequestError(
      `No course found with id: ${courseId}`
    );
  }

  const department = await DepartmentModel.create({ departmentName, courseId });

  course.departments.push(department._id);
  await course.save();

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Department created!",
    id: department._id,
  });
};

const getDepartments = async (req, res) => {
  const courseId = req?.query?.courseId;

  if (!courseId?.trim()) {
    throw new CustomAPIError.BadRequestError("Course Id is required!");
  }

  const course = await CourseModel.findById(courseId);
  if (!course) {
    throw new CustomAPIError.NotFoundError(
      `Course with id: ${courseId} doesn't exist!`
    );
  }

  const departments = await DepartmentModel.find({ courseId });
  res.status(StatusCodes.OK).json({
    success: true,
    message: `Departments batches for course id: ${courseId}`,
    departments,
  });
};

module.exports = {
  createCourse,
  getAllCourses,
  createBatch,
  getBatches,
  createDepartment,
  getDepartments,
};
