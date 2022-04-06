if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require("body-parser");
const methodOverride = require('method-override')

const Log = require("./models/log")
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

    console.log(kiosk.address)
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
    let kiosk
    let logs
    try{
        kiosk = await Kiosk.findById(req.params.id)
        console.log("looking for " + req.params.id + " : " + kiosk.address)
        logs = await Log.find({}, {projection : {address: kiosk.address}})
        console.log(logs[0].address)
        res.render("maintenance", {id: req.params.id, address: kiosk.address, logs: logs})
    } catch{
        if(kiosk == null){
            res.render('error')
        }else{
            res.redirect('/')
        }
    }
})

app.post("/maintenance", async(req, res) => {

    // const theLog = {
    //     address: req.body.adr,
    //     description: req.body.newLog,
    //     createdAt: new Date() 
    // }

    const log = new Log({
        address: req.body.adr,
        description: req.body.newLog,
        createdAt: new Date()
    })

    console.log(log.address)

    log.save((err, newLog) => {
        if(err){
            res.render('error')
        }else{
            res.redirect('/maintenance/' + req.body.id)
        }
    })
    // try{
    //     const newLog = await log.save();
    //     res.redirect("maintenance/" + req.body.id)
    // }catch{
    //     res.render("error")
    // }
})

app.delete('/:id', async (req, res) => {
    console.log(req.params.id)
    let kiosk
    try{
        kiosk = await Kiosk.findById(req.params.id)
        console.log(kiosk.address)
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