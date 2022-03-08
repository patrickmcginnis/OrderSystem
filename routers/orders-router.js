const mongoose = require("mongoose");
const ObjectId= require('mongoose').Types.ObjectId;
const Order = require('../Models/OrderModel');
const express = require('express');

let router = express.Router();

router.get("/:id", sendSingleOrder);
router.post("/", express.json(), createOrder);


router.param("id", function(req, res, next, value){
    let oid;
    console.log("Finding order by ID: " + value);
    try{
        oid = new ObjectId(value);
    }catch(err){
        res.status(404).send("Order ID " + value + " does not exist.");
        return;
    }

    Order.findById(value, function(err, result){
        if(err){
            console.log(err);
            res.status(500).send("Error reading movie.");
            return;
        }

        if(!result){
            res.status(404).send("Review ID " + value + " does not exist.");
            return;
        }

        req.order = result;
        console.log("Result:");
        console.log(result);

        next();

    });
});

function sendSingleOrder(req, res, next){
    res.format({
        "application/json": function () {
            res.status(200).json(req.order);
        },
        "text/html": () => {
            res.render("order", {order: req.order});
        }
    });

    next();
}

function createOrder(req, res, next) {
    //Generate a random product
    let o = new Order();
    o.customer = req.session._id;
    o.restaurantName = req.body.restaurantName;
    o.subtotal = req.body.subtotal;
    o.total= req.body.total;
    o.fee =req.body.fee;
    o.tax = req.body.tax;
    o.order = req.body.order;
    console.log('saved' + o);
    o.save(function (err, result) {
        if (err) {
            console.log(err);
            res.status(500).send("Error creating order.");
            return;
        }
        res.redirect('back');
    });
}
module.exports = router;