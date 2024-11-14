const UserModel = require('../models/User');
const CompanyModel = require('../models/Company');

const CustomAPIError = require('../errors');
const { StatusCodes } = require('http-status-codes');
const { validateStudentCourse } = require('../utils');
const JobOpeningModel = require('../models/JobOpenings');
const { default: mongoose } = require('mongoose');

const getStudents = async (req, res) => {
  const page = req?.query?.page || 1;
  const limit = req?.query?.limit || 15;

  const { course, departments, batches } = req?.query;

  const skip = (page - 1) * limit;

  const query = { role: 'student' };

  if (course) query['courseId'] = course;
  if (batches) query['batchId'] = { $in: batches.split('|') };
  if (departments) query['departmentId'] = { $in: departments.split('|') };

  const studentsCount = await UserModel.countDocuments(query);
  const totalPages = Math.ceil(studentsCount / limit);

  if (totalPages && totalPages < page)
    throw new CustomAPIError.BadRequestError(`Invalid page no ${page}`);

  const students = await UserModel.find(query)
    .select(
      'name isLateralEntry rollNo courseId courseName batchId batchYear departmentId departmentName'
    )
    .sort('rollNo')
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

const addSingleStudent = async (req, res) => {
  const {
    name,
    email,
    password,
    confirmPassword,
    rollNo,
    isLateralEntry,
    courseId,
    departmentId,
    batchId,
  } = req.body;

  if (password !== confirmPassword)
    throw new CustomAPIError.BadRequestError(
      "Password and Confirm Password don't match!"
    );

  const {
    courseName,
    courseLevel,
    departmentName,
    batchYear,
    yearsCount,
    semestersCount,
  } = await validateStudentCourse({
    courseId,
    departmentId,
    batchId,
    isLateralEntry,
  });

  const user = await UserModel.create({
    name,
    email,
    password,
    rollNo,
    isLateralEntry,
    yearsCount,
    semestersCount,
    courseId,
    courseLevel,
    courseName,
    departmentId,
    departmentName,
    batchId,
    batchYear,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Created student',
    id: user._id,
  });
};

const updateSingleStudent = async (req, res) => {
  const id = req?.params?.id;

  if (!id?.trim())
    throw new CustomAPIError.NotFoundError(`No student found with id: ${id}`);

  const { name, rollNo, isLateralEntry, courseId, departmentId, batchId } =
    req.body;

  const {
    courseName,
    courseLevel,
    departmentName,
    batchYear,
    yearsCount,
    semestersCount,
  } = await validateStudentCourse({
    courseId,
    departmentId,
    batchId,
    isLateralEntry,
  });

  const user = await UserModel.findByIdAndUpdate(
    id,
    {
      name,
      rollNo,
      isLateralEntry,
      yearsCount,
      semestersCount,
      courseId,
      courseLevel,
      courseName,
      departmentId,
      departmentName,
      batchId,
      batchYear,
    },
    { runValidators: true }
  );

  if (!user)
    throw new CustomAPIError.NotFoundError(`No student found with id: ${id}`);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Updated student',
  });
};

const getCompanies = async (req, res) => {
  const companies = await CompanyModel.find().select('-admins');
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Companies found!',
    companies,
  });
};

const getSingleCompany = async (req, res) => {
  const companyId = req?.params?.companyId;
  if (!companyId?.trim())
    throw new CustomAPIError.BadRequestError('Company Id is required!');

  const company = await CompanyModel.findById(companyId).populate({
    path: 'admins',
    select: 'name email photo companyRole',
  });

  if (!company)
    throw new CustomAPIError.NotFoundError(
      `No company found with id: ${companyId}`
    );

  res
    .status(StatusCodes.OK)
    .json({ success: true, message: 'Company found!', company });
};

const addCompany = async (req, res) => {
  const { companyName: name, companyEmail: email, about } = req.body;
  let website = req?.body?.website;

  if (website && !website.match(/^https?:\/\//)) {
    website += 'https://';
  }

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

const updateCompany = async (req, res) => {
  const companyId = req?.params?.companyId;
  const { companyName: name, companyEmail: email, about } = req.body;

  let website = req?.body?.website;

  if (website && !website.match(/^https?:\/\//)) {
    website += 'https://';
  }

  const company = await CompanyModel.findByIdAndUpdate(
    companyId,
    {
      name,
      email,
      about,
      website,
    },
    { runValidators: true }
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Company updated!',
    id: company._id,
  });

  await JobOpeningModel.updateMany(
    { 'company.id': new mongoose.Types.ObjectId(companyId) },
    {
      $set: {
        'company.name': name,
        'company.website': website,
      },
    }
  );
};

const addCompanyAdmin = async (req, res) => {
  const companyId = req?.params?.companyId;
  const {
    companyAdminName: name,
    companyAdminEmail: email,
    companyAdminPassword: password,
    confirmAdminPassword: confirmPassword,
    adminRole: companyRole,
  } = req.body;
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
  addSingleStudent,
  updateSingleStudent,
  getStudents,
  getCompanies,
  getSingleCompany,
  addCompany,
  updateCompany,
  addCompanyAdmin,
};
