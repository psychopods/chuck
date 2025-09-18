const pool = require("../config/config")

const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { service_id, booking_date, pax_count } = req.body;

    // find matching rate
    const rateResults = await pool.query(
      `SELECT price 
       FROM rates 
       WHERE service_id = $1 AND pax_min <= $2 AND pax_max >= $2
       LIMIT 1`,
      [service_id, pax_count]
    );

    let totalPrice;
    if (rateResults.rows.length > 0) {
      totalPrice = rateResults.rows[0].price;
    } else {
      // fallback: base price from services
      const serviceResult = await pool.query(
        `SELECT base_price FROM services WHERE id=$1`,
        [service_id]
      );
      if (serviceResult.rows.length === 0) {
        return res.status(404).json({ error: "Service Not Found." });
      }
      totalPrice = serviceResult.rows[0].base_price;
    }

    // insert booking
    const result = await pool.query(
      `INSERT INTO bookings (user_id, service_id, booking_date, pax_count, total_price)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, service_id, booking_date, pax_count, totalPrice]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ success: false, message: "Booking Failed", error: err.message});
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

module.exports = {cancelBooking, createBooking, getMyBookings};