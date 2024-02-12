const mongoose = require('mongoose');

function jobApplicationsAgg({ companyId }) {
  companyId = new mongoose.Types.ObjectId(companyId);
  return [
    {
      $match: {
        'company.id': companyId,
        status: 'open',
        applications: {
          $exists: true,
          $not: {
            $size: 0,
          },
        },
      },
    },
    {
      $addFields: {
        shortlistedCount: {
          $size: '$shortlistedCandidates',
        },
        pendingCount: {
          $size: '$applicants',
        },
        hiredCount: {
          $size: '$selectedCandidates',
        },
        rejectedCount: {
          $size: '$rejectedCandidates',
        },
      },
    },
    {
      $project: {
        profile: 1,
        openingsCount: 1,
        deadline: 1,
        applications: 1,
        shortlistedCount: 1,
        hiredCount: 1,
        rejectedCount: 1,
        pendingCount: 1,
      },
    },
    {
      $lookup: {
        from: 'jobapplications',
        localField: 'applications',
        foreignField: '_id',
        as: 'applications',
        pipeline: [
          {
            $project: {
              applicantId: 1,
              applicantName: 1,
              coverLetter: 1,
              resume: 1,
              portfolio: 1,
              status: 1,
            },
          },
          {
            $group: {
              _id: { status: '$status' },
              applications: {
                $push: '$$ROOT',
              },
            },
          },
        ],
      },
    },
  ];
}

module.exports = {
  jobApplicationsAgg,
};
