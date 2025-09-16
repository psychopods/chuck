const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const pool = require("../config/config")

const register = async(req, res)=>{
    try {
        const {name, email, phone, password} = req.body;
        const hash = await bcrypt.hash(password, 10)

        const result = await pool.query(
            `INSERT INTO users (name, email, phone, password_hash)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, email, role`,
            [name, email, phone, hash]
        )
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({message:"Error Occured", error: err.message})
    }
}

const login = async(req,res)=>{
    try {
        const {email, password} = req.body;
        const result = await pool.query(
            `SELECT * FROM users WHERE email=$1`,[email]
        );

        if (result.rows.length === 0) return res.status(401).json({error: "Invalid Credentials."});
        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.password_hash);

        if(!valid) return res.status(401).json({message:"Invalid Credentials"});

        const token = jwt.sign(
            {id:user.id, role:user.role, email:user.email},
            process.env.JWT_TOKEN,
            {expiresIn: process.env.JWT_EXPIRATION}
        );
        res.json({
            token,
            user: {id:user.id, name:user.name, email:user.email, role:user.role}
        })
    } catch (err) {
        res.status(500).json({error:err.message})
    }
}

const updateUser = async(req,res)=>{
    try {
        const userId = req.user.id;
        const{name, email, phone, password} = req.body;

        let hash;
        if(password){hash = await bcrypt.hash(password, 10)}
        const result = await pool.query(`
            UPDATE users SET name = COALESCE($1, name),
            email = COALESCE($2, email),
            phone = COALESCE($3, phone),
            password_hash = COALESCE($4, password_hash)
            WHERE id = $5
            RETURNING id, name, email, role`,[
                name || null, email || null, phone || null, hash || null, userId
            ]
        );
        if(result.rows.length === 0) return res.status(404).json({error: "user not found"});
        res.json({message: "Successfully Updated Account", user:result.rows[0]});

    } catch (err) {
        return res.status(500).json({error:err.message});
    }
}

const deleteUser = async(req,res)=>{
    try {
        const userId = req.user.id;
        const result = await pool.query(`
            DELETE FROM users WHERE id=$1 RETURNING id`,[userId]
        );

        if(result.rows.length === 0) return res.status(404).json({error:"User not Found"});
        res.json({message: "Account Deleted Successfull"});
    } catch (err) {
        return res.status(500).json({error: err.message})
    }
}

module.exports = {login, register, deleteUser, updateUser}