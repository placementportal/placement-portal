const CustomAPIError = require('../errors');
const { CourseModel } = require('../models/Course');

function validateModelDoc(doc, message) {
  const error = doc.validateSync();
  if (error) {
    for (let key in error?.errors) {
      message = error?.errors?.[key]?.message;
      break;
    }
    throw new CustomAPIError.BadRequestError(message);
  }
}

async function validateJobReceivers({
  receivingCourse,
  receivingBatch,
  receivingDepartments,
}) {
  if (
    !receivingCourse?.trim() ||
    !receivingBatch?.trim() ||
    !Array.isArray(receivingDepartments) ||
    !receivingDepartments.length
  ) {
    throw new CustomAPIError.BadRequestError('Invalid job receivers!');
  }

  const course = await CourseModel.findById(receivingCourse);
  if (!course) {
    throw new CustomAPIError.BadRequestError(
      `Invalid course provided with id: ${receivingCourse}`
    );
  }

  const batch = course?.batches?.get(receivingBatch);
  if (!batch)
    throw new CustomAPIError.BadRequestError(
      `Invalid batch provided with id: ${receivingBatch}`
    );

  const departments = [];

  for (let receivingDepartment of receivingDepartments) {
    const department = course?.departments?.get(receivingDepartment);
    if (!department)
      throw new CustomAPIError.BadRequestError(
        `Invalid department provided with id: ${receivingDepartment}`
      );
    departments.push({
      id: department._id,
      departmentName: department.departmentName,
    });
  }

  return {
    course,
    batch: { id: batch._id, batchYear: batch.batchYear },
    departments,
  };
}

module.exports = { validateModelDoc, validateJobReceivers };
