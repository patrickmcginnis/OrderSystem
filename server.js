const express = require('express');
const session = require('express-session');
const mongoose = require("mongoose");
const MongoDBStore = require('connect-mongo')
const User = require('./Models/UserModel');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

const store = new MongoDBStore({
    mongoUrl: 'mongodb://127.0.0.1/a4',
    collection: 'sessions'
});
store.on('error', (err) =>{console.error(err);});

//router
let userRouter = require('./routers/users-router');
let orderRouter = require('./routers/orders-router');



//middleware
app.set(path.join(__dirname, 'views')); 
app.set('view engine', 'pug'); //temp engine is pug
app.use(express.static(path.join(__dirname, 'public')));//look pub folder
app.use(express.json()); //use json
app.use(express.urlencoded({extended: true})); //parse form data just incase
//session 
app.use(session({
    secret: 'heat',
    store: store,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: true,
    saveUninitialized: false,
}));
app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});
app.use((req, res, next)=>{ //print the requests
    console.log(`${req.method}: ${req.url}`);
    if(Object.keys(req.body).length >0) {
        console.log('Body: ' + req.body);
    }
    next();
});


app.use('/users', userRouter);
app.use('/orders', orderRouter);
//server routes 
app.get("/logout", logout);
app.get(['/', '/index'], (req, res)=>{res.render('home', req)});
app.get("/register", (req, res)=>{res.render('register', req)});
app.get("/orderform", auth, (req, res)=>{res.render('orderform', req)});
app.get("/profile", auth, (req, res)=>{res.render('orderform', req)});

app.post("/login", function (req, res) {
    if (req.session.loggedin) {
        res.status(200).send("Already logged in.");
        return;
    }

    let ousername;
    let pass;
    console.log("Finding user by username: " + req.body.username);
    try {
        ousername = req.body.username;
        pass = req.body.password;
    } catch (err) {
        res.status(404).send("User ID " + value + " does not exist.");
        return;
    }
    User.findByUsername(ousername, function (err, result) {
        if (err) {
            console.log(err);
            res.status(500).send("Error reading user.");
            return;
        }

        if (!result) {
            res.status(404).send("Username " + ousername + " does not exist.");
            res.status(401).send("Unauthorized");
            return;
        }
        console.log("Logging in with credentials:");
        console.log("Username: " + req.body.username);
        console.log("Password: " + req.body.password);

        req.user = result;
        console.log("Result:");
        console.log(result);
        if (result[0].password === pass) {
            req.session.loggedin = true;

            //We set the username associated with this session
            req.session.username = result[0].username;
            req.session._id = result[0]._id;
            res.redirect('/users/' + result[0]._id);
        } else {
            res.status(401).send("Not authorized. Invalid password.");
        }
    });
});


function logout(req, res, next) {
    if (req.session.loggedin) {
        req.session.loggedin = false;
        req.session.username = undefined;
        req.session._id = undefined;
        res.status(200).render('home', req);
    } else {
        res.status(200).send("You cannot log out because you aren't logged in.");
    }
}

function auth(req, res, next) {
    if(!req.session.loggedin){
        res.status(401).send("Unauthorized");
        return;
    }
    next();
}

mongoose.connect('mongodb://127.0.0.1/a4', {useNewUrlParser: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
        User.init(()=>{
            app.listen(PORT, ()=>console.log("Server listening on port 3000"));
        });
});

