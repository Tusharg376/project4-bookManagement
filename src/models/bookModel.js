const mongoose = require('mongoose')
const objectId = mongoose.Schema.Types.ObjectId
const validator = require("validator")

const bookSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        unique:true
    },
    excerpt:{
        type:String,
        required:true
    },
    userId:{
        type: objectId,
        required:true,
        ref: 'user'
    },
    ISBN:{
        type:String,
        required:true,
        validate : [
         validator.isISBN,
         "invalid ISBN"
        ],
        unique:true
    },
    category:{
        type:String,
        required:true
    },
    subcategory:{
        type:String,
        required:true
    },
    reviews:{
        type:Number,
        default:0
    },
    deletedAt:{
        type:Date,
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    releasedAt:{
        type:Date,
        required:true,
    }
},{timestamps:true})

module.exports = mongoose.model('book', bookSchema)