const express = require("express")
const router = express.Router()
const userController = require('../controllers/userController')
const bookController = require('../controllers/bookController')
const middleWare = require("../middleWare/auth")

router.post('/register', userController.createAuthor)
router.post('/login', userController.loginUser)
router.post('/books', middleWare.mid1, bookController.createBook)
router.get('/books', middleWare.mid1, bookController.getBooks)
router.get("/books/:bookId", middleWare.mid1, bookController.getBooksByParams)
router.put("/books/:bookId",middleWare.mid1,bookController.updateBooks)
router.delete("/books/:bookId",middleWare.mid1,bookController.deleteBook)

router.all('*/',(req ,res)=>{
    res.status(400).send({status: false , message :" path invalid"})
  })


module.exports = router
