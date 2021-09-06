const express = require('express')
require('dotenv').config({
    path: '.env',
})
const cookieParser = require('cookie-parser')
const app = express();
const port = process.env.PORT || 8080;

app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}))
app.use(cookieParser())

app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Printer Tracker Running on Port ${port}`))