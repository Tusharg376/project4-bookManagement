const express = require("express")
const router = express.Router()
const userController = require('../controllers/userController')
const bookController = require('../controllers/bookController')

router.post('/register', userController.createAuthor)
router.post('/login', userController.loginUser)
router.post('/books', bookController.createBook)
router.get('/books', bookController.getBooks)


module.exports = router