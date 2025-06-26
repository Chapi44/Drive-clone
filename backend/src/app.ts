import express from "express";
import cors from "cors";

import dotenv from "dotenv";

import initRoutes from "./api";
import mongoDB from "./DbConnection/mongoDb";
import path from "path";


dotenv.config();


mongoDB.connect();
const app = express();

app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Accept, Content-Type, access-control-allow-origin, x-api-applicationid, authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "OPITIONS, GET, PUT, PATCH, POST, DELETE"
  );
  next();
});
app.use(express.json());
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

initRoutes(app);



app.use((req, res, next) => {
  res.status(404).json({
    message:
      "Ohh you are lost, read the API documentation to find your way back home :)",
  });
});





const initApp = async () => {
  try {

    const PORT = process.env.PORT; // Use PORT_OTP from .env or fallback to 4500

    app.listen(Number(PORT), function connectionListener() {
      console.log(`Hi there! I'm listening on port ${PORT} `);
    });


  } catch (err) {
    console.error("Failed to load configuration and start the server:", err);
    process.exit(1); // Exit the process with an error code
  }
};

initApp();

export default app;
