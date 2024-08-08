const multer = require("multer");
const express = require("express");
const churchController = require("../Controllers/churchController");
const { validateToken } = require("../middlewares/validateToken");
const rightsCheck = require("../middlewares/churchAdminRights");
const { authorize } = require("../middlewares/rolePermissionCheck");
const { permissions } = require("../utils/permissions");

const { churchProfileStorage } = require("../utils/storage");
// const { cacheMiddleware } = require("../middlewares/redis");

const upload = multer({ storage: churchProfileStorage });
const router = express.Router();

router.post(
  "/create-church-onboarding",
  validateToken,
  churchController.createChurchOnboarding,
);

router
  .route("/:churchId")
  .get(
    validateToken,
    rightsCheck,
    authorize([permissions.church.view, permissions.church.update], "all"),
    churchController.getChurch,
  )
  .patch(
    validateToken,
    rightsCheck,
    authorize([permissions.church.update], "all"),
    churchController.updateChurch,
  );

router.post(
  "/:churchId/logo",
  validateToken,
  rightsCheck,
  authorize([permissions.church.update], "all"),
  upload.single("logo"),
  churchController.uploadChurchLogo,
);

router.get(
  "/:churchId/contacts",
  validateToken,
  rightsCheck,
  authorize([permissions.member.view], "all"),
  churchController.getContactByNameSearch,
);

router.get(
  "/:churchId/members",
  validateToken,
  rightsCheck,
  // cacheMiddleware({
  //   options: {
  //     EX: 21600, // 6 hours
  //     NX: false,
  //   },
  // }),
  authorize([permissions.member.view], "all"),
  churchController.getMembers,
);

router.get(
  "/:churchId/stats",
  validateToken,
  rightsCheck,
  authorize([permissions.user.viewAdmin], "all"),
  churchController.getMembersStats,
);

router.get(
  "/:churchId/roles",
  validateToken,
  rightsCheck,
  authorize([permissions.role.update], "all"),
  churchController.getRoles,
);

module.exports = router;
