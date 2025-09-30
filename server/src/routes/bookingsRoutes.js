const express = require("express");
const auth = require("../middleware/auth")
const {cancelBooking, createBooking, getMyBookings,deleteAllBookings, deleteBooking, updateBookingStatus} = require("../controllers/bookingsCont")

const router = express.Router();


router.post("/createBooking", auth, createBooking);
router.get("/getBookings", auth, getMyBookings);
router.put("/cancel.appointment/:id/cancel", auth, cancelBooking);
router.delete("/delete.booking/:id", auth, deleteBooking); //for future use
router.delete("/delete.all.bookings", auth, deleteAllBookings); //for future use
router.patch("/:id/status", auth, updateBookingStatus); //admin

module.exports = router