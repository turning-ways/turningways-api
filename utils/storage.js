/* eslint-disable no-unused-vars */
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const AppError = require("./appError");
const { logger } = require("./logger");
const MemberService = require("../services/member.service");
const ChurchService = require("../services/church.service");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, _file) => {
    const filename = req.params.id;
    try {
      const member = await MemberService.findMemberById(filename);
      if (!member) {
        throw new Error("Member not found");
      }
      if (member.profile.photo) {
        const result = await cloudinary.api.resource(filename);
        if (result) {
          await cloudinary.uploader.destroy(filename);
        }
      }
    } catch (err) {
      logger.error(err.message);
      throw new AppError(err.message, 404);
    }
    return {
      folder: "user-profiles",
      public_id: filename,
      allowedFormats: ["jpg", "jpeg", "png"],
    };
  },
});

const churchProfileStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, _file) => {
    const filename = req.params.churchId;
    try {
      const church = await ChurchService.findChurchById(filename);
      if (!church) {
        throw new Error("Church not found");
      }
      if (church.settings.logo) {
        const result = await cloudinary.api.resource(
          `church-profiles/${filename}`,
        );
        if (result) {
          await cloudinary.uploader.destroy(filename);
        }
      }
    } catch (err) {
      logger.error(err.message);
      throw new AppError(err.message, 404);
    }
    return {
      folder: "church-profiles",
      public_id: filename,
      allowedFormats: ["jpg", "jpeg", "png"],
    };
  },
});

module.exports = {
  storage,
  churchProfileStorage,
};
