// Constants or module
const express=require("express")
const app=express()
const cors=require("cors")
const port = process.env.PORT || 3005; // Notez que c'est PORT en majuscules
const bodyParser= require("body-parser")

// Create node js server
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended:true
}))

const controller=require('./controller/controller')
app.use(controller)

app.listen(port,(err)=>{
    if (err) throw err;
    console.log(`Server is running on port: ${port}`)
})


// Create postgresql connection and pool
// DONE IN db/db.js

// create controller-implement CRUD functionnalities
// DONE IN controller/controller.js