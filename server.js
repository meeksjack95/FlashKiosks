if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require("body-parser");
const methodOverride = require('method-override')

const Log = require('./models/log')
const Kiosk = require('./models/kiosk')


app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'Layouts/layout')
app.use(methodOverride('_method'))
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())

const mongoose = require('mongoose');
const kiosk = require('./models/kiosk');
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

    //console.log(kiosk.address)
    kiosk.save((err, newKiosk) => {
        if(err){
            res.render('error')
        }else{
            res.redirect('/')
        }
    })
    
    //console.log(req.body.newKiosk)
    //res.render('index')
})

app.get("/maintenance/:id", async (req, res) => {
    let searchOptions = {}
    if(req.query.address != null && req.query.name !== ''){
        searchOptions.address = new RegExp(req.query.address, 'i')
    }
    try{
        const kiosk = await Kiosk.findById(req.params.id)
        const logs = await Log.find({"address":kiosk.address})
        res.render('maintenance', {
            id: req.params.id,
            address: kiosk.address,
            logs : logs,
            searchOptions: req.query
        })
    } catch {
        res.render('Error')
    }
})

app.delete("/maintenance/:id", async (req, res) => {
    //console.log(req.params.id)
    let log
    try{
        log = await Log.findById(req.params.id)
        //console.log(kiosk.address)
        await log.remove()
        res.redirect('back')
    } catch{
        if(log == null){
            res.render('error')
        }else{
            res.redirect('/maintenance/')
        }
    }
})

app.post("/maintenance", async(req, res) => {

    const log = new Log({
        address: req.body.adr,
        description: req.body.newLog,
        createdAt: new Date()
    })

    log.save((err, newLog) => {
        if(err){
            res.render('error')
        }else{
            res.redirect('/maintenance/' + req.body.id)
        }
    })
})

app.delete('/:id', async (req, res) => {
    console.log("root?")
    let kiosk
    try{
        kiosk = await Kiosk.findById(req.params.id)
        //console.log(kiosk.address)
        await kiosk.remove()
        res.redirect('/')
    } catch{
        if(kiosk == null){
            res.render('error')
        }else{
            res.redirect('/')
        }
    }
})
//TODO: DELETE

app.listen(process.env.PORT || 3000)