const express = require("express");
const auth = require("../middleware/auth")
const {cancelBooking, createBooking, getMyBookings} = require("../controllers/bookingsCont")

const router = express.Router();

router.post("/createBooking", auth, createBooking);
router.get("/getBookings", auth, getMyBookings),
router.put("/cancel.appointment/:id/cancel", auth, cancelBooking)

module.exports = router