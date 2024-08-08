const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const churchService = require("../services/church.service");
const churchValidation = require("../validations/churchValidation");
const Contact = require("../model/contactModel");
const Church = require("../model/churchModel");
const AppError = require("../utils/appError");
const ChurchService = require("../services/church.service");

exports.createChurchOnboarding = [
  catchAsync(async (req, res, next) => {
    const { churchData, memberData } = req.body;
    const church = await churchService.createChurchOnBoarding(
      memberData,
      churchData,
      req,
    );
    res.status(201).json({
      status: "success",
      message: "Church created successfully",
      data: {
        churchId: church.church._id,
        churchName: church.church.name,
        // churchLogo: church.settings.logo,
      },
    });
  }),
];

exports.uploadChurchLogo = catchAsync(async (req, res, next) => {
  const church = await Church.findById(req.params.churchId);
  if (!church) {
    return next(new AppError("No church found with that ID", 404));
  }

  if (!req.file) {
    return next(new AppError("Please upload a file", 400));
  }

  if (req.file) {
    church.settings.logo = req.file.filename;
    await church.save();
  }

  res.status(200).json({
    status: "success",
    data: {
      churchId: church._id,
      churchName: church.name,
      churchLogo: church.settings.logo,
    },
  });
});

exports.getChurch = catchAsync(async (req, res, next) => {
  const church = await Church.findById(req.params.churchId).select(
    "-__v   -isHQ -isDeleted -parentChurch -level",
  );
  if (!church) {
    return next(new AppError("No church found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    message: "Church retrieved successfully",
    data: {
      church,
    },
  });
});

exports.updateChurch = [
  churchValidation.churchUpdateValidation,
  catchAsync(async (req, res, next) => {
    const data = req.body;
    const existingChurch = await churchService.findChurchById(
      req.params.churchId,
    );

    if (!existingChurch) {
      return res.status(404).json({
        status: "fail",
        message: "Church not found",
      });
    }

    const updatedData = {
      name: data.name || existingChurch.name,
      level: data.level || existingChurch.level,
      parentChurch: data.parentChurch || existingChurch.parentChurch,
      location: {
        address:
          data.address ||
          (existingChurch.location && existingChurch.location.address),
        city:
          data.city ||
          (existingChurch.location && existingChurch.location.city),
        state:
          data.state ||
          (existingChurch.location && existingChurch.location.state),
        country:
          data.country ||
          (existingChurch.location && existingChurch.location.country),
        postalCode:
          data.postalCode ||
          (existingChurch.location && existingChurch.location.postalCode),
      },
      contact: {
        email:
          data.email ||
          (existingChurch.contact && existingChurch.contact.email),
        phone:
          data.phone ||
          (existingChurch.contact && existingChurch.contact.phone),
      },
      settings: {
        logo:
          data.logo ||
          (existingChurch.settings && existingChurch.settings.logo),
        website:
          data.website ||
          (existingChurch.settings && existingChurch.settings.website),
      },
      socialMedia: {
        facebook:
          data.facebook ||
          (existingChurch.socialMedia && existingChurch.socialMedia.facebook),
        twitter:
          data.twitter ||
          (existingChurch.socialMedia && existingChurch.socialMedia.twitter),
        instagram:
          data.instagram ||
          (existingChurch.socialMedia && existingChurch.socialMedia.instagram),
        youtube:
          data.youtube ||
          (existingChurch.socialMedia && existingChurch.socialMedia.youtube),
        linkedin:
          data.linkedin ||
          (existingChurch.socialMedia && existingChurch.socialMedia.linkedin),
      },
    };

    const church = await churchService.updateChurch(
      req.params.churchId,
      updatedData,
    );

    res.status(200).json({
      status: "success",
      message: "Church updated successfully",
      data: {
        church,
      },
    });
  }),
];

exports.deleteChurch = catchAsync(async (req, res, next) => {
  const church = await Church.findByIdAndDelete(req.params.churchId);
  if (!church) {
    return next(new AppError("No church found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    message: "Church deleted successfully",
    data: null,
  });
});

exports.getMembers = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1; // page number
  const limit = parseInt(req.query.limit, 10) || 20; // page limit
  const skip = (page - 1) * limit;

  const members = await churchService.getAllMembers(
    req.params.churchId,
    limit,
    skip,
  );
  res.status(200).json({
    status: "success",
    message: "Members retrieved successfully",
    data: {
      members,
    },
  });
});

exports.getContactByNameSearch = catchAsync(async (req, res, next) => {
  const { churchId } = req.params;
  const { search } = req.query;

  // find all contacts that match the search query and group them by their contactType and only select their firstName, lastName, and email and id
  const contacts = await Contact.aggregate([
    {
      $match: {
        churchId: new mongoose.Types.ObjectId(churchId),
        $or: [
          { "profile.firstName": { $regex: search, $options: "i" } },
          { "profile.lastName": { $regex: search, $options: "i" } },
          { "profile.email": { $regex: search, $options: "i" } },
        ],
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: "$contactType",
        contacts: {
          $push: {
            id: "$_id",
            firstName: "$profile.firstName",
            lastName: "$profile.lastName",
            email: "$profile.email",
          },
        },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    message: "Contacts retrieved successfully",
    data: {
      contacts,
    },
  });
});

exports.uploadChurchLogo = catchAsync(async (req, res, next) => {
  const churchExists = await Church.findById(req.params.churchId);
  if (!churchExists) {
    return next(new AppError("No church found with that ID", 404));
  }

  if (!req.file) {
    return next(new AppError("Please upload a file", 400));
  }

  const church = await ChurchService.uploadChurchLogo(req.params.churchId, req);

  res.status(200).json({
    status: "success",
    data: {
      churchId: church._id,
      churchName: church.name,
      churchLogo: church.settings.logo,
    },
  });
});

exports.getMembersStats = catchAsync(async (req, res, next) => {
  const membersStats = await churchService.getMemberCount(req.params.churchId);
  const memberStats2 = await churchService.getMembersJoinedStats(
    req.params.churchId,
    req.query.dateParam,
  );
  res.status(200).json({
    status: "success",
    message: "Members stats retrieved successfully",
    data: {
      TotalMembers: membersStats,
      MembersJoined: memberStats2,
    },
  });
});
