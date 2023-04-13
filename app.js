const express = require("express");
const path = require("path");
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError')
const Joi = require('joi');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');

const mongoose = require("mongoose");
mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/medimatch', {
  useNewUrlParser: true,
  useUnifiedTopology: true})
.then(() =>{
    console.log("Connection open !");
})
.catch((err) => {
    console.log("Oh No! Error :(");
    console.log(err); 
} )
  
const app = express();

app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const spots = require('./routes/spot');
const reviews = require('./routes/reviews');


app.use(express.urlencoded({extended : true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
  secret : 'thisisasecret',
  resave: false,
  saveUninitialized: true,
  cookie:{
    httpOnly:true,
    expires: Date.now() + 1000*60*60*24*7,
    maxAge: 1000*60*60*24*7
  }
}
app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) =>{
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

app.get("/", (req, res) =>{
  res.send("Hello ");
});

//----------------importing routes------------------ 
app.use('/doctors', doctors);
app.use('/spots/:id/reviews', require('./routes/reviews'));

//------------------error handling------------------
app.all('*', (req, res, next) => {
  next(new ExpressError('Page not found !', 404));
});
app.use((err, req, res, next) => {
  const {statusCode = 500} = err;
  if(!err.message) { err.message = "Oh No, Something went wrong !!!"};
  res.status(statusCode).render('error', {err});
});

// -------------listening--------------------------
app.listen("8080", (req, res) =>{
    console.log("Listening in port 8080...");
});