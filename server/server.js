const express = require("express")
const cors = require("cors")
require("dotenv").config();
const port = process.env.PORT;
const authRoutes = require("./src/routes/authRoutes");
const bookingRoutes = require("./src/routes/bookingsRoutes")
const servicesRoutes = require("./src/routes/servicesRoutes")

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json())

app.use("/api/auth", authRoutes);
app.use("/api/services", servicesRoutes)
app.use("/api/bookings", bookingRoutes);

app.listen(port, ()=>
    console.log(`Server is Runnin' on Port ${port}`)
)