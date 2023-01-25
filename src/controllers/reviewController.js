const reviewModel = require("../models/reviewModel");
const bookModel = require("../models/bookModel");
const mongoose = require('mongoose');

/**
 * ## Review APIs
### POST /books/:bookId/review
- Add a review for the book in reviews collection.
- Check if the bookId exists and is not deleted before adding the review. Send an error response with appropirate status code like [this](#error-response-structure) if the book does not exist
- Get review details like review, rating, reviewer's name in request body.
- Update the related book document by increasing its review count
- Return the updated book document with reviews data on successful operation. The response body should be in the form of JSON object like [this](#successful-response-structure)
 */

/**
 * {
  "_id": ObjectId("88abc190ef0288abc190ef88"),
  bookId: ObjectId("88abc190ef0288abc190ef55"),
  reviewedBy: "Jane Doe",
  reviewedAt: "2021-09-17T04:25:07.803Z",
  rating: 4,
  review: "An exciting nerving thriller. A gripping tale. A must read book."
}
 */

module.exports.createReview = async (req, res) =>{
    try {
	let bookId = req.params.bookId
	    let data = req.body
	     
	    let {review, rating, reviewedBy } = data
	    if(!rating){return res.status(400).send({status:false , message: "rating  is mandatory "})}
	    if(review){review = review.trim()}
	   // if(rating){rating = rating.trim()}
	    if(reviewedBy){reviewedBy = reviewedBy.trim()}
	
	   // if(!(review == "" || rating == "" )){return res.status(400).send({status:false , message: "enter mandatory "})}
	
	    if (!( data.rating >= 1 || data.rating <=5))
	    return res.status(400).send({status: false, message: 'Rating should be an Integer & between 1 to 5'})
	     
	    let checkBookId = await bookModel.findOne({_id:bookId, isDeleted:false})
	
	    if(!checkBookId){return res.status(404).send({status:false, message:"book  not found"})}
	    
	    if(!reviewedBy){data.reviewedBy= "Guest"}
	
	    data.bookId = bookId
	    data.reviewedAt = Date.now()
	    
	    let createData = await reviewModel.create(data)

        await bookModel.findOneAndUpdate({_id:bookId, isDeleted:false}, {$inc:{reviews:1}})

        let {_id , reviewedAt,} = createData

        let finalData = {_id , bookId , reviewedBy, reviewedAt, rating, review}
	
	    res.status(201).send({status:true, message:"success", data:finalData})
} catch (error) {
    console.log(error.message, "prashant");
	res.status(500).send({status:false, message:error.message})
}

}

