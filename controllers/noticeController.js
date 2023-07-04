const BatchModel = require("../models/Batch");
const DepartmentModel = require("../models/Department");
const NoticeModel = require("../models/Notice");

const CustomAPIError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const { fileUpload } = require("../utils/fileUpload");


