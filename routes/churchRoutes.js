const multer = require("multer");
const express = require("express");
const churchController = require("../Controllers/churchController");
const { validateToken } = require("../middlewares/validateToken");
const rightsCheck = require("../middlewares/churchAdminRights");

const { churchProfileStorage } = require("../utils/storage");
const { cacheMiddleware } = require("../middlewares/redis");

const upload = multer({ storage: churchProfileStorage });
const router = express.Router();

router.post(
  "/create-church-onboarding",
  validateToken,
  churchController.createChurchOnboarding,
);

router
  .route("/:churchId")
  .get(validateToken, rightsCheck, churchController.getChurch)
  .patch(validateToken, rightsCheck, churchController.updateChurch);

router.post(
  "/:churchId/logo",
  validateToken,
  rightsCheck,
  upload.single("logo"),
  churchController.uploadChurchLogo,
);

router.get(
  "/:churchId/contacts",
  validateToken,
  rightsCheck,
  churchController.getContactByNameSearch,
);

router.get(
  "/:churchId/members",
  validateToken,
  rightsCheck,
  // cacheMiddleware({
  //   options: {
  //     EX: 43200, // 12 hours
  //     NX: false,
  //   },
  // }),
  churchController.getMembers,
);

router.get(
  "/:churchId/stats",
  validateToken,
  rightsCheck,
  churchController.getMembersStats,
);

module.exports = router;
