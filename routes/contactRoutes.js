const express = require("express");
const contactController = require("../Controllers/contactController");
const { validateToken } = require("../middlewares/validateToken");

const router = express.Router();

router
  .route("/:churchId")
  .get(validateToken, contactController.getContacts)
  .post(validateToken, contactController.createContact);

router
  .route("/:churchId/contact/:contactId")
  .get(validateToken, contactController.getContact)
  .patch(validateToken, contactController.updateContact)
  .delete(validateToken, contactController.deleteContact);

router
  .route("/:churchId/contact/:contactId/status")
  .post(validateToken, contactController.changeStatus);

router
  .route("/:churchId/contact/:contactId/notes")
  .get(validateToken, contactController.getNotes)
  .post(validateToken, contactController.createNote);

router
  .route("/:churchId/contact/:contactId/notes/:noteId")
  .patch(validateToken, contactController.updateNote)
  .delete(validateToken, contactController.deleteNote);

router
  .route("/:churchId/contact/:contactId/assign/:memberId")
  .post(validateToken, contactController.assignContact)
  .delete(validateToken, contactController.unassignContact);

router
  .route("/:churchId/contact/:contactId/label")
  .post(validateToken, contactController.addLabel)
  .get(validateToken, contactController.getLabels);

router
  .route("/:churchId/contact/:contactId/label/:labelId")
  .delete(validateToken, contactController.removeLabel);

//action
router
  .route("/:churchId/contact/:contactId/action")
  .post(validateToken, contactController.addAction);

router
  .route("/:churchId/contact/:contactId/action/:actionId")
  .patch(validateToken, contactController.updateAction)
  .delete(validateToken, contactController.deleteAction);
module.exports = router;
