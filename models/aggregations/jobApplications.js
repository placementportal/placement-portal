const mongoose = require('mongoose');

function jobApplicationsAgg({ companyId, status }) {
  companyId = new mongoose.Types.ObjectId(companyId);
  return [
    {
      $match: {
        companyId,
        status,
      },
    },
    {
      $lookup: {
        from: 'jobopenings',
        localField: 'jobId',
        foreignField: '_id',
        as: 'job',
        pipeline: [
          {
            $match: {
              status: 'open',
            },
          },
          {
            $addFields: {
              applicantsCount: {
                $size: '$applicants',
              },
              shortlistedCount: {
                $size: '$shortlistedCandidates',
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
              applicantsCount: 1,
              shortlistedCount: 1,
              hiredCount: 1,
              rejectedCount: 1,
              deadline: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: '$job',
      },
    },
  ];
}

module.exports = {
  jobApplicationsAgg,
};
