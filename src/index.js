const express = require("express")
const mongoose =require("mongoose")
const route = require("./route/route")
const app = express();
app.use(express.json())

mongoose.connect("mongodb+srv://newdatabase:Gd6tycxuRBETdhM7@ourowncluster.jzinjug.mongodb.net/group8Database",{useNewUrlParser:true})
    .then(()=> console.log("monogoDb is connected"))
    .catch(err => console.log(err))

app.use("/",route)

app.listen(3000, function(){
    console.log("server is running on port 3000")
})