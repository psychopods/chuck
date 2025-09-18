const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const { getServices, getServiceById, createService } = require("../controllers/servicesCont");

router.post("/create.services", auth, createService);
router.get("/list.all.services", getServices);
router.get("/get.a.service/:id/single", getServiceById);

module.exports = router;