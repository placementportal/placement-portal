const {
  CourseModel,
  DepartmentModel,
  BatchModel,
} = require("../models/Course");

const CustomAPIError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const { fileUpload } = require("../utils/fileUpload");
