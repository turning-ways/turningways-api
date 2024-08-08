const express = require("express");
const contactController = require("../Controllers/contactController");
const { validateToken } = require("../middlewares/validateToken");
const { permissions } = require("../utils/permissions");
const { authorize } = require("../middlewares/rolePermissionCheck");
const rightsCheck = require("../middlewares/churchAdminRights");

const router = express.Router();

router
  .route("/:churchId")
  .get(
    validateToken,
    rightsCheck,
    authorize([permissions.member.view], "all"),
    contactController.getContacts,
  )
  .post(
    validateToken,
    rightsCheck,
    authorize(
      [
        permissions.member.create,
        permissions.member.view,
        permissions.member.update,
        permissions.member.delete,
      ],
      "all",
    ),
    contactController.createContact,
  );

router
  .route("/:churchId/contact/:contactId")
  .get(
    validateToken,
    rightsCheck,
    authorize([permissions.member.view], "all"),
    contactController.getContact,
  )
  .patch(
    validateToken,
    rightsCheck,
    authorize([permissions.member.update], "all"),
    contactController.updateContact,
  )
  .delete(
    validateToken,
    rightsCheck,
    authorize([permissions.member.delete], "all"),
    contactController.deleteContact,
  );

router
  .route("/:churchId/contact/:contactId/status")
  .post(
    validateToken,
    rightsCheck,
    authorize([permissions.member.update, permissions.member.create], "all"),
    contactController.changeStatus,
  );

router
  .route("/:churchId/contact/:contactId/notes")
  .get(
    validateToken,
    rightsCheck,
    authorize([permissions.member.view], "all"),
    contactController.getNotes,
  )
  .post(
    validateToken,
    rightsCheck,
    authorize([permissions.member.update, permissions.member.create], "all"),
    contactController.createNote,
  );

router
  .route("/:churchId/contact/:contactId/notes/:noteId")
  .patch(
    validateToken,
    rightsCheck,
    authorize([permissions.member.update, permissions.member.create], "all"),
    contactController.updateNote,
  )
  .delete(
    validateToken,
    rightsCheck,
    authorize([permissions.member.delete], "all"),
    contactController.deleteNote,
  );

router
  .route("/:churchId/contact/:contactId/assign/:memberId")
  .post(
    validateToken,
    rightsCheck,
    authorize([permissions.member.update, permissions.member.create], "all"),
    contactController.assignContact,
  )
  .delete(
    validateToken,
    rightsCheck,
    authorize([permissions.member.delete], "all"),
    contactController.unassignContact,
  );

router
  .route("/:churchId/contact/:contactId/label")
  .post(
    validateToken,
    rightsCheck,
    authorize([permissions.member.update, permissions.member.create], "all"),
    contactController.addLabel,
  )
  .get(
    validateToken,
    rightsCheck,
    authorize([permissions.member.view], "all"),
    contactController.getLabels,
  );

router
  .route("/:churchId/contact/:contactId/label/:labelId")
  .delete(
    validateToken,
    rightsCheck,
    authorize([permissions.member.delete], "all"),
    contactController.removeLabel,
  );

//action
router
  .route("/:churchId/contact/:contactId/action")
  .post(
    validateToken,
    rightsCheck,
    authorize([permissions.member.update, permissions.member.create], "all"),
    contactController.addAction,
  );

router
  .route("/:churchId/contact/:contactId/action/:actionId")
  .patch(
    validateToken,
    rightsCheck,
    authorize([permissions.member.update, permissions.member.create], "all"),
    contactController.updateAction,
  )
  .delete(
    validateToken,
    rightsCheck,
    authorize([permissions.member.delete], "all"),
    contactController.deleteAction,
  );
module.exports = router;
