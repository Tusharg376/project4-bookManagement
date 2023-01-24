const bookModel = require("../models/bookModel");
const mongoose = require('mongoose')
const userModel = require('../models/userModel')
const reviewModel = require("../models/reviewModel")

// regex
let excerptregex = /^[a-zA-Z,\-.\s]*$/
let ISBNregex = /^(?:ISBN(?:-1[03])?:?●)?(?=[0-9X]{10}$|(?=(?:[0-9]+[-●]){3})[-●0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[-●]){4})[-●0-9]{17}$)(?:97[89][-●]?)?[0-9]{1,5}[-●]?[0-9]+[-●]?[0-9]+[-●]?[0-9X]$/
let categoryregex = /^[a-zA-Z,\s]*$/
let dateRegex = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/

module.exports.createBook = async (req, res) => {
    try {
        let data = req.body;
        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data;
        if (Object.keys(req.body).length == 0)return res.status(400).send({ status: false, message: "Body should not be empty" });

        //Check title
        if (!title) {
            return res.status(400).send({ status: false, message: "title is required" });
        }
        let duplicateTitle = await bookModel.findOne({ title: title });
        if (duplicateTitle) return res.status(400).send({ status: false, message: "This title is already exist" })

        //Check excerpt

        if (!excerpt) {
            return res.status(400).send({ status: false, message: "excerpt is required" });
        }
        if (!excerpt.trim().match(excerptregex)) return res.status(400).send({ status: false, message: "please enter a excerpt of the book" })

        //Check userid
        if (!userId) {
            return res.status(400).send({ status: false, message: "userId is required" });
        }

        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Invalid user id." })
        let checkUser = await userModel.findById(userId)
        if (!checkUser) return res.status(400).send({ status: false, message: "User doesn't exist" });

        //Check ISBN
        if (!ISBN) {
            return res.status(400).send({ status: false, message: "ISBN is required" });
        }
        if (!ISBN.trim().match(ISBNregex)) return res.status(400).send({ status: false, message: "ISBN must contain 10 to 13 digits." });
        let checkIsbn = await bookModel.findOne({ ISBN: ISBN });
        if (checkIsbn) return res.status(400).send({ status: false, message: "This ISBN is already exists" });

        //Check category
        if (!category) {
            return res.status(400).send({ status: false, message: "category is required" });
        }
        if (!category.match(categoryregex)) return res.status(400).send({ status: false, message: "please enter valid category" });

        //Check subcategory
        if (!subcategory) {
            return res.status(400).send({ status: false, message: "subcategory is required" });
        }
        if (!categoryregex.test(subcategory)) return res.status(400).send({ status: false, message: "please enter valid subCategory" });

        if (!releasedAt) {
            return res.status(400).send({ status: false, message: "releasedAt is required" });
        }
        if (!releasedAt.trim().match(dateRegex)) return res.status(400).send({ status: false, message: "please enter valid date" })

        const saveData = await bookModel.create(data);

        res.status(201).send({ status: true,message:'success', data: saveData });
    } catch (err) {
        console.log(err.message);
        res.status(500).send({ status: false, msg: "SOMETHING IS WRONG IN SERVER" });
    }
};


module.exports.getBooks = async (req,res) =>{
try {
    let qparams = req.query

    let {userId, category, subcategory} = qparams

    if(Object.keys(qparams).length==0){

    let findBooks = await bookModel.find({isDeleted:false}).select({_id:1,title:1,excerpt:1,userId:1,category:1,releasedAt:1,reviews:1}).sort({tittle:1})

    if(findBooks.length!=0){return res.status(200).send({status:true,message:'success',data:findBooks})}

    if(findBooks.length == 0){return res.status(404).send({status:false,message:"no documents found"})}
    }
    
    if(userId || category || subcategory){

    let data = await bookModel.find({...qparams, isDeleted:false}).select({__v:0,isDeleted:0,createdAt:0,updatedAt:0,ISBN:0,subcategory:0}).sort({title:1})
    
    if(data.length == 0){return res.status(404).send({status:false, message:"no data found with this query"})}
      
    return res.status(200).send({status:true,message:"books list", data:data})


    }
} catch (error) {
    res.status(500).send({status:false, message:error.message})
}}


module.exports.getBooksByParams = async (req, res) => {
   try {
    let params = req.params.bookId
    
    if(!mongoose.isValidObjectId(params)){return res.status(400).send({status:false, message:"bookId is not valid"})}

    let checkBookId = await bookModel.findOne({_id:params, isDeleted:false}).select({__v:0}).lean()
    if(!checkBookId){return res.status(404).send({status:false, message:"book is not found"})}

    let reviewBook = await reviewModel.find({bookId:checkBookId._id, isDeleted:false})

    checkBookId.reviewsData = reviewBook

    return res.status(200).send({status:true, data:checkBookId})

   } catch (error) {
    res.status(500).send({status:false, message:error.message})
   }    
}

module.exports.updateBooks = async function(req,res){
    try {
	let bookId = req.params.bookId
	    let data = req.body
	
	    if(!Object.keys(data).length) return res.status(400).send({status:false,message:"please provide data for update"})
	
	    if(!mongoose.isValidObjectId(bookId)) return res.status(400).send({status:false,message:"invalid bookId"})
	    
	    let checkTitle = await bookModel.findOne({title:data.title})
	    if(checkTitle) return res.status(400).send({status:false,message:"please provide unique title"})
	    
        if(!(data.ISBN).match(ISBNregex)) return res.status(400).send({status:false,message:"invalid ISBN format"})
	
        let checkISBN = await bookModel.findOne({ISBN:data.ISBN})
	    if(checkISBN) return res.status(400).send({status:false,message:"please provide unique ISBN"})
	    
	    let findBook = await bookModel.findOneAndUpdate({_id:bookId,isDeleted:false},{$set:{title:data.title,excerpt:data.excerpt,releasedAt:Date.now(),ISBN:data.ISBN}},{new:true})
	    
	    if(!findBook) return res.status(404).send({status:false,message:"data not found"})
	    
	    res.status(200).send({status:true,message:"success",data:findBook})
	    
} catch (error) {
    res.status(500).send({status:false,message:error.message})	
}
}

module.exports.deleteBook = async(req,res)=>{
  try{
    let bookId = req.params.bookId
    if(!mongoose.isValidObjectId(bookId)) return res.status(400).send({status:false, message:"Invalid book id"})

    let deletedBook = await bookModel.findOneAndUpdate({_id:bookId, isDeleted:false}, {isDeleted:true, deletedAt: Date.now()},{new:true})

    if(!deletedBook) return res.status(404).send({status:false,message:"data not found"})

    return res.status(200).send({status:true, message:"Book has been deleted successfully"})

  }catch(error){
    res.status(500).send({status:false,message:error.message})
  }
}