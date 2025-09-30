const pool = require("../config/config")

const updateBookingStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required." });
    }
    const allowed = ["pending", "confirmed", "cancelled", "completed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }
    const result = await pool.query(
      `UPDATE bookings SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
      [status, id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found or not authorized." });
    }
    res.json({ message: "Booking status updated.", booking: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM bookings WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found or not authorized." });
    }
    res.json({ message: "Booking deleted.", booking: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteAllBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `DELETE FROM bookings WHERE user_id = $1 RETURNING *`,
      [userId]
    );
    res.json({ message: `Deleted ${result.rows.length} bookings.`, deleted: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { service_id, booking_date, pax_count } = req.body;

    const rateResult = await pool.query(
      `SELECT pax_min, pax_max, price 
       FROM rates 
       WHERE service_id=$1 
       AND pax_min <= $2 AND pax_max >= $2
       LIMIT 1`,
      [service_id, pax_count]
    );

    let totalPrice;

    if (rateResult.rows.length > 0) {
      const rate = rateResult.rows[0];

      if (rate.pax_max === 999) {
        totalPrice = rate.price * pax_count;
      } else {
        totalPrice = rate.price;
      }
    } else {
      const serviceResult = await pool.query(
        "SELECT base_price FROM services WHERE id=$1",
        [service_id]
      );
      if (serviceResult.rows.length === 0) {
        return res.status(404).json({ error: "Service Not Found" });
      }
      totalPrice = serviceResult.rows[0].base_price;
    }

    const result = await pool.query(
      `INSERT INTO bookings (user_id, service_id, booking_date, pax_count, total_price)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, service_id, booking_date, pax_count, totalPrice]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message, message: "Booking Failed" });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;
    let query = `SELECT b.*, s.name as service_name, s.category FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.user_id = $1`;
    let params = [userId];
    if (status === "active") {
      query += " AND b.status != 'cancelled'";
    } else if (status === "cancelled") {
      query += " AND b.status = 'cancelled'";
    }
    query += " ORDER BY b.booking_date DESC";
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const cancelBooking = async(req,res)=>{
    try {
        const userId = req.user.id;
        const {id} = req.params;

        const result = await pool.query(
            `UPDATE bookings SET status='cancelled'
            WHERE id=$1 AND user_id=$2
            RETURNING *`,
        [id, userId]
        );
        if(result.rows.length === 0) return res.status(404).json({error: "Booking not Found!"});
        res.json({message: "Booking Cancelled", booking:result.rows[0]})
    } catch (err) {
        return res.status(500).json({success:false, error: err.message})
    }
}

module.exports = {cancelBooking, createBooking, getMyBookings, deleteBooking, deleteAllBookings, updateBookingStatus};