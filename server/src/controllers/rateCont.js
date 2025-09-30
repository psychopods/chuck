const pool = require("../config/config");

const getRates = async (req, res) => {
  try {
    const { service_id } = req.query;
    let result;
    if (service_id) {
      result = await pool.query(
        `SELECT * FROM rates WHERE service_id = $1 ORDER BY pax_min ASC`,
        [service_id]
      );
    } else {
      result = await pool.query(`SELECT * FROM rates ORDER BY service_id, pax_min ASC`);
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateRate = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = ["pax_min", "pax_max", "price", "description"];
    const updates = [];
    const values = [];
    let idx = 1;

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${idx}`);
        values.push(req.body[field]);
        idx++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update." });
    }

    values.push(id);
    const query = `UPDATE rates SET ${updates.join(", ")} WHERE id = $${idx} RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Rate not found." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteRate = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM rates WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Rate not found." });
    }
    res.json({ message: "Rate deleted.", rate: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addRates = async (req, res) => {
  try {
    const { service_id, rates } = req.body;

    if (!service_id || !Array.isArray(rates) || rates.length === 0) {
      return res.status(400).json({ error: "service_id and rates array are required" });
    }

    const values = [];
    const placeholders = rates.map((r, i) => {
      const idx = i * 5;
      values.push(service_id, r.pax_min, r.pax_max, r.price, r.description || null);
      return `($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5})`;
    }).join(", ");

    const query = `
      INSERT INTO rates (service_id, pax_min, pax_max, price, description)
      VALUES ${placeholders}
      RETURNING *;
    `;

    const result = await pool.query(query, values);
    res.status(201).json({ message: "Rates added successfully", rates: result.rows });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addRates, getRates, updateRate, deleteRate };
