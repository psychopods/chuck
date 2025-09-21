const express = require("express");
const auth = require("../middleware/auth")
const {cancelBooking, createBooking, getMyBookings,deleteAllBookings, deleteBooking} = require("../controllers/bookingsCont")

const router = express.Router();

router.post("/createBooking", auth, createBooking);
router.get("/getBookings", auth, getMyBookings),
router.put("/cancel.appointment/:id/cancel", auth, cancelBooking)
router.delete("/delete.booking", auth, deleteBooking)
router.delete("/delete.all.bookings", auth, deleteAllBookings)

module.exports = router