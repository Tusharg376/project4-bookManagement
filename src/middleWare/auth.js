const jwt = require("jsonwebtoken")

module.exports.mid1 = async (req, res, next) => {
    let token  = req.headers["x-api-key"]
    if(!token){return res.status(400).send({status:false, msg:"header is mandatory"})}

    jwt.verify(token, "project4Group8", function(err, decode){
        if(err) {return res.status(401).send({status:false, msg:"invalid token"})}

        req.decodeToken = decode

        next()
    })
    
}

module.exports.mid2 = async (req,res,next) => {

        const decodedToken = req.decodedToken;
        
        const bookId = req.params.bookId;
    
        if(!isValidObjectId(bookId)) return res.status(400).send({status:false,msg:"Invalid bookId."});
    
        const book = await bookModel.findOne({_id:bookId,isDeleted:false});
    
        if(!book) return res.status(404).send({status:false,msg:"Book not found."});
    
        if(decodedToken.userId!=book.userId) return res.status(403).send({status:false,msg:"Not authorised"});
    
        next(); 
}
