const {
  CourseModel,
  DepartmentModel,
  BatchModel,
} = require("../models/Course");

const NoticeModel = require("../models/Notice");
const UserModel = require("../models/User");

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

const getAllNotices = async (req, res) => {
  const notices = await NoticeModel.find()
    .sort("-createdAt")
    .populate({
      path: "receivingCourse",
      select: "courseName",
    })
    .populate({
      path: "receivingBatches",
      select: "batchYear",
    })
    .populate({
      path: "receivingDepartments",
      select: "departmentName",
    });
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Notices found!",
    notices,
  });
};

const getMyNotices = async (req, res) => {
  const student_id = req.user.userId;
  const student = await UserModel.findById(student_id);

  const { batchId, departmentId, courseId, lastNoticeFetched } = student;

  const notices = await NoticeModel.find({
    receivingCourse: courseId,
    receivingBatches: batchId,
    receivingDepartments: departmentId,
    createdAt: { $gte: lastNoticeFetched },
  }).select("noticeTitle noticeBody noticeFile createdAt");

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Notices found!",
    notices,
  });

  student.lastNoticeFetched = new Date();
  await student.save();
};

module.exports = {
  createNotice,
  getAllNotices,
  getMyNotices,
};
