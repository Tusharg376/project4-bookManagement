const bookModel = require("../models/bookModel");
const mongoose = require('mongoose')
const userModel = require('../models/userModel')
const reviewModel = require("../models/reviewModel")

module.exports.createBook = async (req, res) => {
    try {
        let data = req.body;
        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data;
        if (Object.keys(req.body).length == 0)
            return res.status(400).send({ status: false, msg: "Body should not be empty " });

        // regex
        let excerptregex = /^[a-zA-Z,\-.\s]*$/
        let ISBNregex = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/
        let categoryregex = /^[a-zA-Z,\s]*$/
        let dateRegex = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/

        //Check title
        if (!title) {
            return res.status(400).send({ status: false, msg: "title is required" });
        }
        let duplicateTitle = await bookModel.findOne({ title: title });
        if (duplicateTitle) return res.status(400).send({ status: false, message: "This title is already exist" })

        //Check excerpt

        if (!excerpt) {
            return res.status(400).send({ status: false, msg: "excerpt is required" });
        }
        if (!excerpt.trim().match(excerptregex)) return res.status(400).send({ status: false, message: "please enter a excerpt of the book" })

        //Check userid
        if (!userId) {
            return res.status(400).send({ status: false, msg: "userId is required" });
        }

        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Invalid user id." })
        let checkUser = await userModel.findById(userId)
        if (!checkUser) return res.status(400).send({ status: false, message: "User doesn't exist" });

        //Check ISBN
        if (!ISBN) {
            return res.status(400).send({ status: false, msg: "ISBN is required" });
        }
        if (!ISBN.trim().match(ISBNregex)) return res.status(400).send({ status: false, message: "ISBN must contain 10 to 13 digits." });
        let checkIsbn = await bookModel.findOne({ ISBN: ISBN });
        if (checkIsbn) return res.status(400).send({ status: false, message: "This ISBN is already exists" });

        //Check category
        if (!category) {
            return res.status(400).send({ status: false, msg: "category is required" });
        }
        if (!category.match(categoryregex)) return res.status(400).send({ status: false, message: "please enter valid category" });

        //Check subcategory
        if (!subcategory) {
            return res.status(400).send({ status: false, msg: "subcategory is required" });
        }
        if (!categoryregex.test(subcategory)) return res.status(400).send({ status: false, message: "please enter valid subCategory" });

        //subcategory = [...new Set(subcategory)]

        //Check releasedat
        if (!releasedAt) {
            return res.status(400).send({ status: false, msg: "releasedAt is required" });
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

    if(findBooks.length!=0){return res.status(200).send({status:true, data:findBooks})}

    if(findBooks.length == 0){return res.send({msg:"no documents found"})}

    }
    
    if(userId || category || subcategory){

    let data = await bookModel.find({...qparams, isDeleted:false}).select({__v:0,isDeleted:0,createdAt:0,updatedAt:0,ISBN:0,subcategory:0}).sort({title:1})
    //.populate("userId",{_id:1,title:1,excerpt:1,userId:1,category:1,releasedAt:1,reviews:1})
    if(data.length == 0){return res.status(404).send({status:false, msg:"no data found with this query"})}
      
    return res.status(200).send({status:true,message:"books list", data:data})


    }
} catch (error) {
    res.status(500).send({status:false, message:error.message})
}}

/**
 * ### GET /books/:bookId
- Returns a book with complete details including reviews. Reviews array would be in the form of Array. Response example [here](#book-details-response)
- Return the HTTP status 200 if any documents are found. The response structure should be like [this](#successful-response-structure) 
- If the book has no reviews then the response body should include book detail as shown [here](#book-details-response-no-reviews) and an empty array for reviewsData.
- If no documents are found then return an HTTP status 404 with a response like [this](#error-response-structure)  */ 


// =================================getbooks by bookId using params===========================================>


module.exports.getBooksByParams = async (req, res) => {
   try {
    let params = req.params.bookId
    
    if(!mongoose.isValidObjectId(params)){return res.status(400).send({status:false, msg:"bookId is not valid"})}

    let checkBookId = await bookModel.findOne({_id:params, isDeleted:false}).lean()
    if(!checkBookId){return res.status(404).send({status:false, msg:"book is not found"})}

    let reviewBook = await reviewModel.find({bookId:checkBookId._id, isDeleted:false})

    checkBookId.reviewsData = reviewBook

    return res.status(200).send({status:true, data:checkBookId})

   } catch (error) {
    res.status(500).send({status:false, message:error.message})
   }


    
}