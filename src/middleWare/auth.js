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
    
}