const {
  CourseModel,
  DepartmentModel,
  BatchModel,
} = require('../models/Course');

const NoticeModel = require('../models/Notice');
const UserModel = require('../models/User');

const CustomAPIError = require('../errors');
const { StatusCodes } = require('http-status-codes');
const { fileUpload } = require('../utils/fileUpload');

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

  let noticeFile = req?.files?.noticeFile;
  if (!noticeTitle?.trim() || !noticeBody?.trim() || !noticeFile)
    throw new CustomAPIError.BadRequestError(
      'Notice title, body and file is required!'
    );

  const createdBy = req.user?.userId;

  const { course, batches, departments } = await validateNoticeReceivers({
    receivingCourse,
    receivingBatches,
    receivingDepartments,
  });

  const fileUploadResp = await fileUpload(noticeFile, 'notices', 'document');

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
    message: 'Notice Created!',
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

const updateNotice = async (req, res) => {
  let {
    noticeTitle,
    noticeBody,
    receivingCourse,
    receivingBatches,
    receivingDepartments,
  } = req.body;

  receivingBatches = JSON.parse(receivingBatches);
  receivingDepartments = JSON.parse(receivingDepartments);

  let noticeFile = req?.files?.noticeFile;

  const createdBy = req.user?.userId;
  const id = req?.params?.id;

  if (!id?.trim()) throw new CustomAPIError.BadRequestError('Id is required');

  if (!noticeTitle?.trim() || !noticeBody?.trim())
    throw new CustomAPIError.BadRequestError(
      'Notice title, body and file is required!'
    );

  const notice = await NoticeModel.findOne({ _id: id, createdBy });
  if (!notice)
    throw new CustomAPIError.NotFoundError(`No notice found with id: ${id}`);

  const { course, batches, departments } = await validateNoticeReceivers({
    receivingCourse,
    receivingBatches,
    receivingDepartments,
  });

  if (noticeFile) {
    const fileUploadResp = await fileUpload(noticeFile, 'notices', 'document');
    noticeFile = fileUploadResp?.fileURL;
  }

  const updatedNotice = await NoticeModel.findByIdAndUpdate(id, {
    noticeTitle,
    noticeBody,
    noticeFile,
    receivingCourse,
    receivingBatches,
    receivingDepartments,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Notice Updated!',
    id,
  });

  course.lastNoticeTime = updatedNotice.updatedAt;
  await course.save();

  for (let batch of batches) {
    batch.lastNoticeTime = updatedNotice.updatedAt;
    await batch.save();
  }

  for (let department of departments) {
    department.lastNoticeTime = updatedNotice.updatedAt;
    await department.save();
  }
};

const deleteNotice = async (req, res) => {
  const createdBy = req.user?.userId;
  const id = req?.params?.id;

  if (!id?.trim()) throw new CustomAPIError.BadRequestError('Id is required');

  const notice = await NoticeModel.findOne({ _id: id, createdBy });
  if (!notice)
    throw new CustomAPIError.NotFoundError(`No notice found with id: ${id}`);

  await NoticeModel.findByIdAndDelete(id);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Notice deleted!',
    id,
  });

  const { receivingCourse, receivingBatches, receivingDepartments } = notice;

  const course = await CourseModel.findById(receivingCourse);
  let courseLastNotice = await NoticeModel.find({ receivingCourse })
    .sort('-updatedAt')
    .limit(1);
  courseLastNotice = courseLastNotice[0];

  course.lastNoticeTime = courseLastNotice?.updatedAt || new Date();
  await course.save();

  for (let receivingBatch of receivingBatches) {
    const batch = await BatchModel.findById(receivingBatch);
    let batchLastNotice = await NoticeModel.find({ receivingBatch })
      .sort('-updatedAt')
      .limit(1);
    batchLastNotice = batchLastNotice[0];

    batch.lastNoticeTime = batchLastNotice?.updatedAt || new Date();
    await batch.save();
  }

  for (let receivingDepartment of receivingDepartments) {
    const department = await DepartmentModel.findById(receivingDepartment);
    let departmentLastNotice = await NoticeModel.find({ receivingDepartment })
      .sort('-updatedAt')
      .limit(1);
    departmentLastNotice = departmentLastNotice[0];

    department.lastNoticeTime = departmentLastNotice?.updatedAt || new Date();
    await department.save();
  }
};

const getAllNotices = async (req, res) => {
  const notices = await NoticeModel.find()
    .sort('-updatedAt')
    .populate({
      path: 'receivingCourse',
      select: 'courseName',
    })
    .populate({
      path: 'receivingBatches',
      select: 'batchYear',
    })
    .populate({
      path: 'receivingDepartments',
      select: 'departmentName',
    });
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Notices found!',
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
  })
    .select('noticeTitle noticeBody noticeFile createdAt updatedAt')
    .sort('-updatedAt');

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Notices found!',
    notices,
    lastNoticeFetched,
  });

  student.lastNoticeFetched = new Date();
  await student.save();
};

async function validateNoticeReceivers(noticeReceivers) {
  const { receivingCourse, receivingBatches, receivingDepartments } =
    noticeReceivers;

  if (
    !receivingCourse?.trim() ||
    !Array.isArray(receivingBatches) ||
    !Array.isArray(receivingDepartments) ||
    !receivingBatches.length ||
    !receivingDepartments.length
  ) {
    throw new CustomAPIError.BadRequestError('Invalid receveirs!');
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

  return { course, batches, departments };
}

module.exports = {
  createNotice,
  updateNotice,
  deleteNotice,
  getAllNotices,
  getMyNotices,
  validateNoticeReceivers,
};
