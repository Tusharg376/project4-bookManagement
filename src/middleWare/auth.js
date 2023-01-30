const jwt = require("jsonwebtoken")
const mongoose = require('mongoose')
const bookModel = require('../models/bookModel')

module.exports.authentication = async (req, res, next) => {
    try {
	let token  = req.headers["x-api-key"]
	    if(!token){return res.status(400).send({status:false, message:"header is mandatory"})}
	
	    jwt.verify(token, "project4Group8", function(err, decode){
	        if(err) {return res.status(401).send({status:false, message:err.message})}
	
	        req.decodeToken = decode
	
	        next()
	    })
} catch (error) {
    res.status(500).send({status:false,message:error.message})
}
    
}

module.exports.paramMid = async (req,res,next) => {

try {
	        
	        let bookId = req.params.bookId;
	    
	        if(!mongoose.isValidObjectId(bookId)) return res.status(400).send({status:false,message:"Invalid bookId."});
	    
	        let book = await bookModel.findOne({_id:bookId,isDeleted:false});
	    
	        if(!book) return res.status(404).send({status:false,message:`No book found by ${bookId}`});
	    
	        if(req.decodeToken.userId!=book.userId) return res.status(403).send({status:false,message:"Not authorised"});
	    
	        next(); 

} catch (error) {
 res.status(500).send({status:false,message:error.message})	
}
}

module.exports.bodyMid = async function(req,res,next){
    try {
	let data = req.body
	    let {userId} = data
        if(!mongoose.isValidObjectId(userId)) return res.status(400).send({status:false,message:"Invalid userID"}) 
	    if(req.decodeToken.userId != userId) return res.status(403).send({status:false,message:"not authorised"})
	    next()
} catch (error) {
	res.status(500).send({status:false,message:error.message})
}
}
