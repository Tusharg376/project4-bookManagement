const reviewModel = require("../models/reviewModel");
const bookModel = require("../models/bookModel");
const mongoose = require('mongoose');


module.exports.createReview = async (req, res) =>{
    try {
	let bookId = req.params.bookId
	    let data = req.body
	    
		if(Object.keys(data).length==0) res.status(400).send({status:false,message:"body can't be empty"})
	    let {review, rating, reviewedBy } = data
	    if(!rating){return res.status(400).send({status:false , message: "rating  is mandatory "})}
	    if(review){review = review.trim()}
	    if(typeof(rating) == "string"){rating = rating.trim()}
	    if(reviewedBy){reviewedBy = reviewedBy.trim()}
		
	    if((review == "" || rating == "" )){return res.status(400).send({status:false , message: "enter mandatory feild"})}
	
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
    console.log(error.message);
	res.status(500).send({status:false, message:error.message})
}
}

// let regexForIsbn=/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/
module.exports.updateReview = async function(req,res){
	try {
	let bookId = req.params.bookId
	let reviewId = req.params.reviewId
	let data = req.body

	if(Object.keys(data).length==0) return res.status(400).send({status:false,message:"body can't be empty"})	

	let {review,rating,reviewedBy} = data
	if(review) review = review.trim()
	if(typeof(rating)=="string") rating = rating.trim()
	if(reviewedBy) reviewedBy = reviewedBy.trim()

	if(!mongoose.isValidObjectId(reviewId)) res.status(400).send({status:falase,message:"invalid reviewId"})
	if(review == "" || rating == "" || reviewedBy == "") return res.status(400).send({status:false,message:"please give some value"})
	
	let checkBookId = await bookModel.findOne({_id:bookId, isDeleted:false})
	if(!checkBookId) return res.status(404).send({status:false,message:"book not found"})

	let updateData = await reviewModel.findOneAndUpdate({_id:reviewId, isDeleted:false}, {$set:{review:review,rating:rating,reviewedBy:reviewedBy}},{new:true}).select({_id:1, bookId:1, reviewedBy:1, reviewedAt :1, review:1 , rating:1})

	if(!updateData) return res.status(404).send({status:false,message:"review data not found"})

	res.status(200).send({status:true,message:"success",data:updateData})
} catch (error) {
	res.status(500).send({status:false,message:error.message})	
}
}


module.exports.deleteReview = async function(req, res) {
    try {
        const reviewId = req.params.reviewId
        const bookId = req.params.bookId; 

        
        if (!mongoose.isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, message: "Invalid reviewId." })
        }
        

        const review= await reviewModel.findOne({ _id: reviewId, isDeleted:false })
          
        if (!review) {
            return res.status(404).send({ status: false, message: `No review found by Id ${reviewId}` })
        }
            
        const deletedData = await reviewModel.findOneAndUpdate({ _id:reviewId },{ $set: { isDeleted: true, deletedAt: Date.now() } },{ new: true })
		
		await bookModel.findOneAndUpdate({_id:bookId},{$inc:{reviews:-1}})
        
		return res.status(200).send({ status: true, message: "deleted successfully" })
        
    } catch (err) {
        return res.status(500).send({ status: false, message: "Something went wrong", Error: err.message })
    }
}