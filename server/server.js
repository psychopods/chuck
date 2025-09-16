const express = require("express")
const cors = require("cors")
require("dotenv").config();
const port = process.env.PORT;
const authRoutes = require("./src/routes/authRoutes");

const app = express();
app.use(cors());
app.use(express.json())

app.use("/api/auth", authRoutes);

app.listen(port, ()=>
    console.log(`Server is Runnin' on Port ${port}`)
)