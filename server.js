if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require("body-parser");

const Kiosk = require('./models/kiosk')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'Layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true
})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

app.get('/', async (req, res) => {
    let searchOptions = {}
    if(req.query.address != null && req.query.name !== ''){
        searchOptions.address = new RegExp(req.query.address, 'i')
    }
    try{
        const kiosks = await Kiosk.find(searchOptions)
        res.render('index', {
            kiosks : kiosks,
            searchOptions: req.query
        })
    } catch {
        res.render('Error')
    }
    
})

app.post('/', (req, res) => {
    const kiosk = new Kiosk({
        address: req.body.newKiosk
    })
    kiosk.save((err, newKiosk) => {
        if(err){
            res.render('Error')
        }else{
            res.redirect('/')
        }
    })
    
    //console.log(req.body.newKiosk)
    //res.render('index')
})

app.listen(process.env.PORT || 3000)