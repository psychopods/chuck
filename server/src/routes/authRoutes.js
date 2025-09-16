const express = require("express");
const auth = require("../middleware/auth")
const {register, login, deleteUser, updateUser} = require("../controllers/authCont");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.delete("/delete", auth, deleteUser);
router.put("/update", auth, updateUser)

module.exports = router