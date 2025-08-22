var express = require('express');
var cors = require('cors')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/usersRoutes');
var professorRouter = require('./routes/professor');
var adminRouter = require('./routes/adminRoutes');
var questionRouter = require("./routes/questionRoutes")

var app = express();
app.use(cors())


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/professor', professorRouter);
app.use('/api/admin', adminRouter);
app.use("/api/questions", questionRouter);


main().catch(err => console.log(err));

async function main() {
    const connectDB = await mongoose.connect(process.env.MONGO_URI,{
      dbName: "s5_database",
    });
    console.log ("connected to MongoDB", connectDB.connection.host);

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

module.exports = app;
