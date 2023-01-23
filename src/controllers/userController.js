const userModel =  require('../models/userModel')
const jwt = require('jsonwebtoken')

const createAuthor = async function(req,res){
    try {
	let data = req.body
	    if(Object.keys(data).length == 0) return res.status(400).send({status:false,message:"request body can't be empty"})
	   
	    let {title,name, phone, email, password, address} = data
	
	    if(!title)  return res.status(400).send({status:false,message:"Please provide title"})
	    if(!name)  return res.status(400).send({status:false,message:"Please provide name"})
	    if(!phone)  return res.status(400).send({status:false,message:"Please provide phone"})
	    if(!email)  return res.status(400).send({status:false,message:"Please provide email"})
	    if(!password)  return res.status(400).send({status:false,message:"Please provide password"})
	    if(!address)  return res.status(400).send({status:false,message:"Please provide address"})
	
	    let titleEnum = userModel.schema.obj.title.enum
	    if(!titleEnum.includes(title)) return res.status(400).send({status:false,message:"title must contain Mr,Miss or Mrs"})
	
        let mailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
        if(!email.match(mailRegex)) return res.status(400).send({status:false,message:"invalid Email format"})

	    let checkMail = await userModel.find({email:email})
	    if(checkMail.length != 0) return res.status(400).send({status:false,message:"email is not unique"})
	
	    let checkPhone = await userModel.find({phone:phone})
	    if(checkPhone.length != 0) return res.status(400).send({status:false,message:"phone number already exist"})
	
	    let passCheck = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,15}$/  //min 8, max 15, upper+lower+numeric
	    if(!password.match(passCheck)) return res.status(400).send({status:false,message:"invalid password format"})
	
	    let finalData = await userModel.create(data)
	    res.status(201).send({status:true,message:'success',data:finalData})
} catch (error) {
    console.log(error.message)
    res.status(500).send({status:false,message:"something is wrong with server"})
}
}


const loginUser = async function (req, res) {
    try {
        const data = req.body
        const { email, password } = req.body

        if(Object.keys(data)==0){
            return res.status(400).send({ status: false, msg: "enter the email and password" })
        };
        if (!email) {
            return res.status(400).send({ status: false, msg: "email is required" });
        };

        const validMail = (mail) =>
         /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(mail);

        if (!validMail(email)) {
            return res.status(400).send({ status: false, msg: "please enter a valid email" });
        };
        if (!password) {
            return res.status(400).send({ status: false, msg: "password is required" });
        };

        const findCredentials = await userModel.findOne({ email:email,password:password });

        if (!findCredentials) {
            return res.status(401).send({ status: false, message: 'Invalid login credentials. Email id or password is incorrect.' });
        };

        const id = findCredentials._id
        const userName = findCredentials.name

        const token =  jwt.sign({
            userId: id,
            name : userName,
            iat: Math.floor(Date.now() / 1000), //time of issuing the token.
            exp: Math.floor(Date.now() / 1000) + 60*30 //setting token expiry time limit.
        },"project4Group8");

        res.header('x-api-key', token);

        return res.status(200).send({ status: true, message: 'success', data:{token:token} });

    } catch (err) {
       return res.status(500).send({status:false , message:err.message})
    };
}
module.exports = {createAuthor, loginUser}