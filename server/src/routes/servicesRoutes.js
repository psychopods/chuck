const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const { 
  getServices, 
  getServiceById, 
  createService, 
  updateService, 
  deleteService 
} = require("../controllers/servicesCont");

router.post("/create.services", auth, createService);
router.get("/list.all.services", getServices);
router.get("/get.a.service/:id/single", getServiceById);

// Update a service (admin only)
router.patch("/update.service/:id", auth, updateService);
router.delete("/delete.service/:id", auth, deleteService);

module.exports = router;