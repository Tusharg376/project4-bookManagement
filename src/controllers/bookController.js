const bookModel = require("../models/bookModel");
const mongoose = require('mongoose')
const userModel = require('../models/userModel')
const reviewModel = require("../models/reviewModel")
const moment = require('moment')

const aws = require("aws-sdk")


// configuration  aws
aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
})


let uploadFile= async ( file) =>{
    return new Promise( function(resolve, reject) {
     let s3= new aws.S3({apiVersion: '2006-03-01'}); 
 
     var uploadParams= {
         ACL: "public-read",
         Bucket: "classroom-training-bucket",  
         Key: "abc/" + file.originalname, 
         Body: file.buffer
     }
 
 
     s3.upload( uploadParams, function (err, data ){
         if(err) {
             return reject({"error": err})
         }
         console.log(data)
         console.log("file uploaded succesfully")
         return resolve(data.Location)
     })
 
    })
 }

// regex
let ISBNregex = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/
let categoryregex = /^[a-zA-Z,\s]*$/


module.exports.createBook = async (req, res) => {
    try {
        let files = req.files
        let data = req.body;
        let { title, excerpt, userId, ISBN, category, subcategory  } = data;
        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "Body should not be empty" });
        // files check
       
        if(files && files.length>0){
            let uploadFileUrl = await uploadFile(files[0])
            data.bookCover = uploadFileUrl
        }else{ return res.status(400).send({msg:"no file found"})}
      
        if (!title) return res.status(400).send({ status: false, message: "title is required" });
        else title = title.trim()
        if (!excerpt) return res.status(400).send({ status: false, message: "excerpt is required" });
        else excerpt = excerpt.trim()
        if (!userId) return res.status(400).send({ status: false, message: "userId is required" });
        else userId = userId.trim()
        if (!ISBN) return res.status(400).send({ status: false, message: "ISBN is required" });
        else ISBN = ISBN.trim()
        if (!category) return res.status(400).send({ status: false, message: "category is required" });
        else category = category.trim()
        if (!subcategory) return res.status(400).send({ status: false, message: "subcategory is required" });
        else subcategory = subcategory.trim()

        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Invalid user id." })

        if (!ISBN.match(ISBNregex)) return res.status(400).send({ status: false, message: "ISBN must contain 10 to 13 digits." });
        if (!category.match(categoryregex)) return res.status(400).send({ status: false, message: "please enter valid category" });
        if (!categoryregex.test(subcategory)) return res.status(400).send({ status: false, message: "please enter valid subCategory" });

        let duplicateTitle = await bookModel.findOne({ title: title });
        if (duplicateTitle) return res.status(400).send({ status: false, message: "This title is already exist" })

        let checkUser = await userModel.findById(userId)
        if (!checkUser) return res.status(400).send({ status: false, message: "User doesn't exist" });

        let checkIsbn = await bookModel.findOne({ ISBN: ISBN });
        if (checkIsbn) return res.status(400).send({ status: false, message: "This ISBN already exists" });

        if(!data.releasedAt) data.releasedAt = moment().format("YYYY-MM-DD")
        let {releasedAt, bookCover} = data
        let saveData = await bookModel.create({ title, excerpt, userId, ISBN, category, subcategory ,releasedAt,bookCover});

        return res.status(201).send({ status: true, message: 'success', data:saveData});
    } catch (err) {
        console.log(err.message);
        res.status(500).send({ status: false, msg: err.message });
    }
};


module.exports.getBooks = async (req, res) => {
    try {
        let qparams = req.query

        let { userId, category, subcategory, title, excerpt, ISBN, reviews } = qparams

        if (Object.keys(qparams).length == 0) {

            let findBooks = await bookModel.find({ isDeleted: false }).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort({ title: 1 })

            if (findBooks.length != 0) return res.status(200).send({ status: true, message: 'Books list', data: findBooks })

            if (findBooks.length == 0) return res.status(404).send({ status: false, message: "no documents found" })
        }

        if (title || excerpt || ISBN || reviews) return res.status(400).send({ status: false, message: "invalid query" })

        if (userId || category || subcategory) {

            let data = await bookModel.find(qparams, { isDeleted: false }).select({ __v: 0, isDeleted: 0, createdAt: 0, updatedAt: 0, ISBN: 0, subcategory: 0 }).sort({ title: 1 })

            if (data.length == 0) { return res.status(404).send({ status: false, message: "no data found with this query" }) }

            return res.status(200).send({ status: true, message: "Books list", data: data })
        }
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


module.exports.getBooksByParams = async (req, res) => {
    try {
        let params = req.params.bookId

        if (!mongoose.isValidObjectId(params)) { return res.status(400).send({ status: false, message: "bookId is not valid" }) }

        let checkBookId = await bookModel.findOne({ _id: params, isDeleted: false }).select({ __v: 0 }).lean()
        if (!checkBookId) { return res.status(404).send({ status: false, message: "book is not found" }) }

        let reviewBook = await reviewModel.find({ bookId: checkBookId._id, isDeleted: false }).select({ _id: 1, bookId: 1, reviewedBy: 1, reviewedAt: 1, review: 1, rating: 1 })

        checkBookId.reviewsData = reviewBook

        return res.status(200).send({ status: true, message: "Books list", data: checkBookId })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

module.exports.updateBooks = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let data = req.body
        if (!Object.keys(data).length) return res.status(400).send({ status: false, message: "please provide data for update" })

        if (data.title) { data.title = data.title.trim() }
        if (data.ISBN) { data.ISBN = data.ISBN.trim() }
        if (data.excerpt) { data.excerpt = data.excerpt.trim() }

        if (data.title == "" || data.ISBN == "" || data.excerpt == "") return res.status(400).send({ status: false, message: "please give a valid Input " })
        let checkTitle = await bookModel.findOne({ title: data.title })
        if (checkTitle) return res.status(400).send({ status: false, message: "please provide unique title" })
        if (data.ISBN) {
            if (!(data.ISBN).match(ISBNregex)) return res.status(400).send({ status: false, message: "invalid ISBN format" })
        }

        let checkISBN = await bookModel.findOne({ ISBN: data.ISBN })
        if (checkISBN) return res.status(400).send({ status: false, message: "please provide unique ISBN" })

        let findBook = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { $set: { title: data.title, excerpt: data.excerpt, releasedAt: Date.now(), ISBN: data.ISBN } }, { new: true })

        if (!findBook) return res.status(404).send({ status: false, message: "data not found" })

        res.status(200).send({ status: true, message: "success", data: findBook })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

module.exports.deleteBook = async (req, res) => {
    try {
        let bookId = req.params.bookId
        if (!mongoose.isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "Invalid book id" })

        let deletedBook = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { isDeleted: true, deletedAt: Date.now() }, { new: true })

        if (!deletedBook) return res.status(404).send({ status: false, message: "data not found" })

        await reviewModel.updateMany({ bookId: bookId }, { $set: { isDeleted: true } })

        return res.status(200).send({ status: true, message: "Book has been deleted successfully" })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}