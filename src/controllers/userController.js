const userModel =  require('../models/userModel')

const createAuthor = async function(req,res){
    let data = req.body
    if(Object.keys(data).length == 0) return res.status(400).send({status:false,message:"req can't be empty"})
   
    let {title,name, phone, email, password, address} = data
    let {street, city , pincode} = data.address

    if(!title)  return res.status(400).send({status:false,message:"Please provide title"})
    if(!name)  return res.status(400).send({status:false,message:"Please provide name"})
    if(!phone)  return res.status(400).send({status:false,message:"Please provide phone"})
    if(!email)  return res.status(400).send({status:false,message:"Please provide email"})
    if(!password)  return res.status(400).send({status:false,message:"Please provide password"})
    if(!address)  return res.status(400).send({status:false,message:"Please provide address"})
    if(!street)  return res.status(400).send({status:false,message:"Please provide street"})
    if(!city)  return res.status(400).send({status:false,message:"Please provide city"})
    if(!pincode)  return res.status(400).send({status:false,message:"Please provide pincode"})

    let titleEnum = userModel.schema.obj.title.enum
    if(!titleEnum.includes(title)) return res.status(400).send({status:false,message:"title must contain Mr,Miss or Mrs"})

    let passCheck = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,15}$/  //min 8, max 15, upper+lower+numeric
    if(!passCheck.match(password)) return res.status(400).send({status:false,message:"invalid password format"})

    let checkUnique = await userModel.find({$and:[{isDeleted:false},{$or:[{phone:phone},{email:email}]}]})
    if(checkUnique) return res.status(400).send({status:false,message:"phone or email is not unique"})
    let finalData = await userModel.create(data)
    res.status(201).send({status:true,message:'success',data:finalData})
}

module.exports = {createAuthor}