const UserModel = require('../models/User');
const CompanyModel = require('../models/Company');

const CustomAPIError = require('../errors');
const { StatusCodes } = require('http-status-codes');

const getStudents = async (req, res) => {
  const page = req?.query?.page || 1;
  const limit = req?.query?.limit || 15;
  const course = req?.query?.course;
  const batch = req?.query?.batch;
  const dept = req?.query?.dept;

  const skip = (page - 1) * limit;

  const query = { role: 'student' };

  if (course) query['courseId'] = course;

  if (batch) query['batchId'] = { $in: batch.split('|') };

  if (dept) query['departmentId'] = { $in: dept.split('|') };

  const studentsCount = await UserModel.countDocuments(query);
  const totalPages = Math.ceil(studentsCount / limit);

  if (totalPages < page)
    throw new CustomAPIError.BadRequestError(`Invalid page no ${page}`);

  const students = await UserModel.find(query)
    .select('name courseId batchId departmentId')
    .populate({
      path: 'courseId',
      select: 'courseName',
    })
    .populate({
      path: 'batchId',
      select: 'batchYear',
    })
    .populate({
      path: 'departmentId',
      select: 'departmentName',
    })
    .sort('roll_no')
    .skip(skip)
    .limit(limit);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Found students',
    students,
    page,
    limit,
    totalPages,
  });
};

const addCompany = async (req, res) => {
  const { name, email, about, website } = req.body;

  const company = await CompanyModel.create({
    name,
    email,
    about,
    website,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Company created',
    id: company._id,
  });
};

const addCompanyAdmin = async (req, res) => {
  const { name, email, password, confirmPassword, companyRole, companyId } =
    req.body;
  const role = 'company_admin';

  if (password !== confirmPassword)
    throw new CustomAPIError.BadRequestError(
      "Password & Confirm Password don't match!"
    );

  if (!companyRole?.trim() || !companyId?.trim())
    throw new CustomAPIError.BadRequestError('Company & Role is required!');

  const company = await CompanyModel.findById(companyId);
  if (!company)
    throw new CustomAPIError.BadRequestError(
      `No company found with id: ${companyId}`
    );

  const companyAdmin = await UserModel.create({
    name,
    email,
    password,
    companyRole,
    companyId,
    role,
  });

  company.admins.push(companyAdmin._id);
  await company.save();

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Company Admin created!',
    id: companyAdmin._id,
  });
};

module.exports = {
  getStudents,
  addCompany,
  addCompanyAdmin,
};
