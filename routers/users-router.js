const mongoose = require("mongoose");
const ObjectId= require('mongoose').Types.ObjectId;
const User = require('../Models/UserModel');
const express = require('express');

let router = express.Router();

router.get("/", queryParser);
router.get("/", loadUsers);
router.get("/", respondUsers);
router.get("/:id", sendSingleUser);

router.post("/", createUser);
router.post("/:id", updateUser);

router.param("id", function(req, res, next, value){
    let oid;
    console.log("Finding user by ID: " + value);
    try{
        oid = new ObjectId(value);
    }catch(err){
        res.status(404).send("User ID " + value + " does not exist.");
        return;
    }

    User.findById(value, function(err, result){
        if(err){
            console.log(err);
            res.status(500).send("Error reading user.");
            return;
        }

        if(!result){
            res.status(404).send("User ID " + value + " does not exist.");
            return;
        }

        req.user = result;
        console.log("Result:");
        console.log(result);
        result.findOrders(function(err, result){
            if(err){
                console.log(err);
                next();
                return;
            }

            req.user.orders = result;
            next();
        })

    });

});

function queryParser(req, res, next){
    const MAX_USERS = 50;

    //build a query string to use for pagination later
    let params = [];
    for(prop in req.query){
        if(prop == "page"){
            continue;
        }
        params.push(prop + "=" + req.query[prop]);
    }
    req.qstring = params.join("&");

    try{
        req.query.limit = req.query.limit || 100;
        req.query.limit = Number(req.query.limit);
        if(req.query.limit > MAX_USERS){
            req.query.limit = MAX_USERS;
        }
    }catch{
        req.query.limit = 100;
    }

    try{
        req.query.page = req.query.page || 1;
        req.query.page = Number(req.query.page);
        if(req.query.page < 1){
            req.query.page = 1;
        }
    }catch{
        req.query.page = 1;
    }


    if(!req.query.username){
        req.query.username = "?";
    }

    next();
}

function loadUsers(req, res, next){
    let startIndex = ((req.query.page-1) * req.query.limit);
    let amount = req.query.limit;

    User.find()
        .where("username").regex(new RegExp(".*" + req.query.username + ".*", "i"))
        .limit(amount)
        .skip(startIndex)
        .exec(function(err, results){
            if(err){
                res.status(500).send("Error reading users.");
                console.log(err);
                return;
            }
            console.log("Found " + results.length + " matching users.");
            res.users = results;
            next();
            return;
        })
}


function respondUsers(req, res, next){
    res.format({
        "text/html": () => {res.render("users", {users: res.users, qstring: req.qstring, current: req.query.page } )},
        "application/json": () => {res.status(200).json(res.users)}
    });
    next();
}

function sendSingleUser(req, res, next){
    res.format({
        "application/json": function () {
            res.status(200).json(req.user);
        },
        "text/html": () => {
            res.render("user", {user: req.user});
        }
    });

    next();
}

function createUser(req, res, next){
    console.log('Creating User');
    let u = new User();
    u.username = req.body.username;
    u.password = req.body.password;
    u.privacy = false;
    u.orders =  [];

    u.save(function(err, result) {
        if (err) {
            console.log(err);
            res.status(500).send("Error creating User.");
            return;
        }
        res.redirect("/");
    });

}

function updateUser(req, res, next) {
    console.log("Updating User");
    let priv = req.body.privacy;
    console.log("Selection: " + priv);
    User.findByIdAndUpdate(req.session._id, { $set: {privacy: priv}}, function (err, user){
        if (err) {
            responseObject.err = err;
            responseObject.data = null;
            responseObject.code = 422;
        
            return res.json(responseObject);
          }
        
        
          return res.redirect('back');
    });
    
}
module.exports = router;