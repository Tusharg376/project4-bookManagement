const express = require("express")
const router = express.Router()
const {createAuthor,loginUser}  = require('../controllers/userController')
const {createBook,getBooks,getBooksByParams,updateBooks,deleteBook} = require('../controllers/bookController')
const {authentication,bodyMid,paramMid} = require("../middleWare/auth")
const {createReview,updateReview,deleteReview} = require("../controllers/reviewController")



router.post('/register', createAuthor)
router.post('/login', loginUser)

router.post('/books', authentication, bodyMid, createBook)
router.get('/books', authentication, getBooks)
router.get("/books/:bookId", authentication, getBooksByParams)
router.put("/books/:bookId",authentication,paramMid,updateBooks)
router.delete("/books/:bookId",authentication,paramMid,deleteBook)

router.post("/books/:bookId/review",  createReview)
router.put('/books/:bookId/review/:reviewId',  updateReview)
router.delete('/books/:bookId/review/:reviewId',  deleteReview)

router.all('*/',(req ,res)=>{
  res.status(400).send({status: false , message :"HTTP path invalid"})
})


module.exports = router
