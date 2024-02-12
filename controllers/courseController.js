const {
  CourseModel,
  DepartmentModel,
  BatchModel,
} = require('../models/Course');

const CustomAPIError = require('../errors');
const { StatusCodes } = require('http-status-codes');

const createCourse = async (req, res) => {
  const {
    courseName,
    courseLevel,
    regularYearsCount,
    regularSemestersCount,
    isLateralAllowed,
    lateralYearsCount,
    lateralSemestersCount,
  } = req.body;

  const course = await CourseModel.create({
    courseName,
    courseLevel,
    regularYearsCount,
    regularSemestersCount,
    isLateralAllowed,
    lateralYearsCount,
    lateralSemestersCount,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Course Created!',
    id: course._id,
  });
};

const getAllCourses = async (req, res) => {
  const courses = await CourseModel.find().select('-batches -departments');
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Found all courses!',
    courses,
  });
};

const createBatch = async (req, res) => {
  const courseId = req?.params?.courseId;
  const batchYear = req?.body?.batchYear;

  if (!courseId?.trim()) {
    throw new CustomAPIError.BadRequestError('Course Id is required!');
  }

  const course = await CourseModel.findById(courseId);
  if (!course) {
    throw new CustomAPIError.BadRequestError(
      `No course found with id: ${courseId}`
    );
  }

  const batch = new BatchModel({ batchYear });
  course.batches.set(batch._id.toString(), batch);
  await course.save();

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Batch created!',
    id: batch._id,
  });
};

const getBatches = async (req, res) => {
  const courseId = req?.params?.courseId;

  if (!courseId?.trim()) {
    throw new CustomAPIError.BadRequestError('Course Id is required!');
  }

  const course = await CourseModel.findById(courseId);
  if (!course) {
    throw new CustomAPIError.NotFoundError(
      `Course with id: ${courseId} doesn't exist!`
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Found batches for course id: ${courseId}`,
    batches: course.batches,
  });
};

const createDepartment = async (req, res) => {
  const courseId = req?.params?.courseId;
  const { departmentName, departmentCode } = req.body;

  if (!courseId?.trim()) {
    throw new CustomAPIError.BadRequestError('Course Id is required!');
  }

  const course = await CourseModel.findById(courseId);
  if (!course) {
    throw new CustomAPIError.BadRequestError(
      `No course found with id: ${courseId}`
    );
  }

  const department = new DepartmentModel({ departmentName, departmentCode });
  course.departments.set(department._id.toString(), department);
  await course.save();

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Department created!',
    id: department._id,
  });
};

const getDepartments = async (req, res) => {
  const courseId = req?.params?.courseId;

  if (!courseId?.trim()) {
    throw new CustomAPIError.BadRequestError('Course Id is required!');
  }

  const course = await CourseModel.findById(courseId);
  if (!course) {
    throw new CustomAPIError.NotFoundError(
      `Course with id: ${courseId} doesn't exist!`
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Departments batches for course id: ${courseId}`,
    departments: course.departments,
  });
};

const getCourseOptions = async (req, res) => {
  const courses = await CourseModel.find().select(
    'courseName batches departments'
  );

  const options = [];

  courses.forEach((course) => {
    const departments = [];
    const batches = [];

    course.departments.forEach((value, key) => {
      departments.push({
        departmentId: key,
        departmentName: value.departmentName,
      });
    });

    course.batches.forEach((value, key) => {
      batches.push({
        batchId: key,
        batchYear: value.batchYear,
      });
    });

    options.push({
      courseId: course._id,
      courseName: course.courseName,
      departments,
      batches,
    });
  });

  res.status(StatusCodes.OK).json({
    success: true,
    options,
  });
};

module.exports = {
  createCourse,
  getAllCourses,
  createBatch,
  getBatches,
  createDepartment,
  getDepartments,
  getCourseOptions,
};
