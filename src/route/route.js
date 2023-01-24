const express = require("express")
const router = express.Router()
const userController = require('../controllers/userController')
const bookController = require('../controllers/bookController')
const middleWare = require("../middleWare/auth")

router.post('/register', userController.createAuthor)
router.post('/login', userController.loginUser)
router.post('/books', middleWare.authentication, middleWare.bodyMid, bookController.createBook)
router.get('/books', middleWare.authentication, bookController.getBooks)
router.get("/books/:bookId", middleWare.authentication, bookController.getBooksByParams)
router.put("/books/:bookId",middleWare.authentication,middleWare.paramMid,bookController.updateBooks)
router.delete("/books/:bookId",middleWare.authentication,middleWare.paramMid,bookController.deleteBook)

router.all('*/',(req ,res)=>{
    res.status(400).send({status: false , message :"HTTP path invalid"})
  })

module.exports = router
