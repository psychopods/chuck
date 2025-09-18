const pool = require("../config/config");

const getServices = async(req,res)=>{
    try {
        const result = await pool.query(
            `SELECT * FROM services ORDER BY id ASC`
        );
        res.json(result.rows)
    } catch (err) {
        res.status(500).json({success:false, error: err.message})
    }
}

const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const serviceResults = await pool.query(
            `SELECT * FROM services WHERE id=$1`,
            [id]
        );

        if (serviceResults.rows.length === 0)
            return res.status(404).json({ message: "Service not Found." });

        const ratesResult = await pool.query(
            `SELECT * FROM rates WHERE service_id=$1 ORDER BY pax_min ASC`,
            [id]
        );

        res.json({ ...serviceResults.rows[0], rates: ratesResult.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const createService = async(req,res)=>{ //for Admin Only
    try {
        const {name, description, category, base_price, image, capacity} = req.body;

        const result = await pool.query(
            `INSERT INTO services (name,description, category,base_price, image, capacity)
            VALUES($1,$2,$3,$4,$5,$6)
            RETURNING *`,[name, description, category, base_price, image, capacity]
        );
        res.status(201).json(result.rows);
    } catch (err) {
        res.status(500).json({success:false, error: err.message})
    }
}

module.exports = {createService, getServiceById, getServices}