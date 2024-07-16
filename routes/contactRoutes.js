const express = require("express");
const contactController = require("../Controllers/contactController");
const { validateToken } = require("../middlewares/validateToken");

const router = express.Router();

router
  .route("/:churchId/contacts")
  .get(validateToken, contactController.getContacts)
  .post(validateToken, contactController.createContact);

router
  .route("/:churchId/contacts/:contactId")
  .get(validateToken, contactController.getContact)
  .patch(validateToken, contactController.updateContact)
  .delete(validateToken, contactController.deleteContact);

router
  .route("/:churchId/contacts/:contactId/status")
  .get(validateToken, contactController.changeStatus);

router
  .route("/:churchId/contacts/:contactId/notes")
  .get(validateToken, contactController.getNotes)
  .post(validateToken, contactController.createNote);

router
  .route("/:churchId/contacts/:contactId/notes/:noteId")
  .patch(validateToken, contactController.updateNote)
  .delete(validateToken, contactController.deleteNote);

router
  .route("/:churchId/contacts/:contactId/assign/:memberId")
  .post(validateToken, contactController.assignContact)
  .delete(validateToken, contactController.unassignContact);

router
  .route("/:churchId/contacts/:contactId/label")
  .post(validateToken, contactController.addLabel)
  .get(validateToken, contactController.getLabels);

router
  .route("/:churchId/contacts/:contactId/label/:labelId")
  .delete(validateToken, contactController.removeLabel);

//action
router
  .route("/:churchId/contacts/:contactId/action")
  .post(validateToken, contactController.addAction);

router
  .route("/:churchId/contacts/:contactId/action/:actionId")
  .patch(validateToken, contactController.updateAction);
module.exports = router;
