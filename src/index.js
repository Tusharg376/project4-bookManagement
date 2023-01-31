const express = require("express")
const mongoose = require("mongoose")
const route = require("./route/route")
const app = express();
const multer = require("multer");
const appConfig = require("aws-sdk")
app.use(express.json())
mongoose.set('strictQuery', false)

app.use(multer().any())

app.use((err, req, res, next) => {
  if (err.message === "Unexpected end of JSON input") {
    return res.status(400).send({
      status: false, message: "ERROR Parsing Data, Please Provide a Valid JSON",
    });
  } else {
    next();
  }
})

mongoose.connect("mongodb+srv://newdatabase:Gd6tycxuRBETdhM7@ourowncluster.jzinjug.mongodb.net/group8Database", { useNewUrlParser: true })
  .then(() => console.log("monogoDb is connected"))
  .catch(err => console.log(err))

app.use("/", route)

app.listen(3000, function () {
  console.log("server is running on port 3000")
})