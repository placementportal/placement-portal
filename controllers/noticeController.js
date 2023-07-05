const {
  CourseModel,
  DepartmentModel,
  BatchModel,
} = require("../models/Course");

const NoticeModel = require("../models/Notice");

const CustomAPIError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const { fileUpload } = require("../utils/fileUpload");

const createNotice = async (req, res) => {
  let {
    noticeTitle,
    noticeBody,
    receivingCourse,
    receivingBatches,
    receivingDepartments,
  } = req.body;

  receivingBatches = JSON.parse(receivingBatches);
  receivingDepartments = JSON.parse(receivingDepartments);

  let { noticeFile } = req?.files;

  const createdBy = req.user?.userId;

  if (!noticeTitle?.trim() || !noticeBody?.trim() || !noticeFile) {
    throw new CustomAPIError.BadRequestError(
      "Notice title, body and file are required!"
    );
  }

  if (
    !receivingCourse?.trim() ||
    !Array.isArray(receivingBatches) ||
    !Array.isArray(receivingDepartments) ||
    !receivingBatches.length ||
    !receivingDepartments.length
  ) {
    throw new CustomAPIError.BadRequestError("Invalid receveirs!");
  }

  const course = await CourseModel.findById(receivingCourse);
  if (!course) {
    throw new CustomAPIError.BadRequestError(
      `No course found with id: ${receivingCourse}`
    );
  }

  let departments = [],
    batches = [];

  for (let receivingBatch of receivingBatches) {
    const batch = await BatchModel.findById(receivingBatch);
    if (!batch) {
      throw new CustomAPIError.BadRequestError(
        `No batch found with id: ${receivingBatch}`
      );
    }
    batches.push(batch);
  }

  for (let receivingDepartment of receivingDepartments) {
    const department = await DepartmentModel.findById(receivingDepartment);
    if (!department) {
      throw new CustomAPIError.BadRequestError(
        `No Department found with id: ${receivingDepartment}`
      );
    }
    departments.push(department);
  }

  const fileUploadResp = await fileUpload(noticeFile, "notices", "document");

  noticeFile = fileUploadResp?.fileURL;

  const notice = await NoticeModel.create({
    noticeTitle,
    noticeBody,
    noticeFile,
    receivingCourse,
    receivingBatches,
    receivingDepartments,
    createdBy,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Notice Created!",
    id: notice._id,
  });

  course.lastNoticeTime = notice.createdAt;
  await course.save();

  for (let batch of batches) {
    batch.lastNoticeTime = notice.createdAt;
    await batch.save();
  }

  for (let department of departments) {
    department.lastNoticeTime = notice.createdAt;
    await department.save();
  }
};

module.exports = {
  createNotice,
};
