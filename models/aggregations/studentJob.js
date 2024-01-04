const mongoose = require('mongoose');

function studentJobOpeningsAgg({ courseId, batchId, departmentId, userId }) {
  userId = new mongoose.Types.ObjectId(userId);
  courseId = new mongoose.Types.ObjectId(courseId);
  batchId = new mongoose.Types.ObjectId(batchId);
  departmentId = new mongoose.Types.ObjectId(departmentId);

  return [
    {
      $match: {
        receivingCourse: courseId,
        receivingBatches: batchId,
        receivingDepartments: departmentId,
        status: 'open',
        deadline: {
          $gte: new Date(),
        },
        applicants: {
          $nin: [userId],
        },
        shortlistedCandidates: {
          $nin: [userId],
        },
        selectedCandidates: {
          $nin: [userId],
        },
        rejectedCandidates: {
          $nin: [userId],
        },
      },
    },
    {
      $addFields: {
        applicantsCount: {
          $size: '$applicants',
        },
      },
    },
    {
      $project: {
        receivingCourse: 0,
        receivingBatches: 0,
        receivingDepartments: 0,
        applicants: 0,
        shortlistedCandidates: 0,
        rejectedCandidates: 0,
        selectedCandidates: 0,
        status: 0,
      },
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'company',
        foreignField: '_id',
        as: 'company',
        pipeline: [
          {
            $project: {
              name: 1,
              website: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: '$company',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'postedBy',
        foreignField: '_id',
        as: 'postedBy',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: '$postedBy',
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ];
}

function studentJobsByStatusAgg({ userId, status }) {
  const jobInclude = { _id: 0 };
  const jobExclude = {};
  let jobPath;

  switch (status) {
    case 'applied':
      jobPath = 'jobsApplied';
      jobInclude['jobsApplied'] = 1;
      jobExclude['jobsApplied'] = 0;
      break;
    case 'rejected':
      jobPath = 'jobsRejected';
      jobInclude['jobsRejected'] = 1;
      jobExclude['jobsRejected'] = 0;
      break;
    case 'shortlisted':
      jobPath = 'jobsShortlisted';
      jobInclude['jobsShortlisted'] = 1;
      jobExclude['jobsShortlisted'] = 0;
      break;
    case 'hired':
      jobPath = 'jobsSelected';
      jobInclude['jobsSelected'] = 1;
      jobExclude['jobsSelected'] = 0;
      break;
  }

  return [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $project: jobInclude,
    },
    {
      $lookup: {
        from: 'jobopenings',
        localField: jobPath,
        foreignField: '_id',
        as: 'jobs',
        pipeline: [
          {
            $addFields: {
              applicantsCount: {
                $size: '$applicants',
              },
            },
          },
          {
            $project: {
              receivingCourse: 0,
              receivingBatches: 0,
              receivingDepartments: 0,
              applicants: 0,
              shortlistedCandidates: 0,
              rejectedCandidates: 0,
              selectedCandidates: 0,
              status: 0,
            },
          },
          {
            $lookup: {
              from: 'companies',
              localField: 'company',
              foreignField: '_id',
              as: 'company',
              pipeline: [
                {
                  $project: {
                    name: 1,
                    website: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: {
              path: '$company',
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'postedBy',
              foreignField: '_id',
              as: 'postedBy',
              pipeline: [
                {
                  $project: {
                    name: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: {
              path: '$postedBy',
            },
          },
        ],
      },
    },
    {
      $project: jobExclude,
    },
    {
      $unwind: {
        path: '$jobs',
      },
    },
    {
      $replaceRoot: {
        newRoot: '$jobs',
      },
    },
  ];
}

module.exports = {
  studentJobOpeningsAgg,
  studentJobsByStatusAgg,
};
