const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const { addRates, getRates, updateRate, deleteRate } = require("../controllers/rateCont");

router.get("/list", getRates);

//(admin only)
router.post("/add", auth, addRates);
router.patch("/update/:id", auth, updateRate);
router.delete("/delete/:id", auth, deleteRate);

module.exports = router;
