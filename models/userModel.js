const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = Schema({
    //usernames will be strings between 1-30 characters
    //Must consist of only A-Z characters
    //Will be trimmed automatically (i.e., outer spacing removed)
    username: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 30,
        match: /[A-Za-z]+/,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    privacy: {
        type: Boolean,
        required: true,
    },
    orders:[{
        type: Schema.Types.ObjectId, ref: 'Order'
    }]
});

userSchema.methods.findOrders = function(callback){
    this.model("Order").find()
        .where("customer").equals(this._id)
        .populate("customer")
        .exec(callback);
};

userSchema.statics.findByUsername = function(username, callback){
    this.find({username: new RegExp(username, 'i')}, callback);
};

userSchema.query.byUsername = function(name){
    //'this' in this case is a query
    //So when we include .byName(someString)
    // in a query somewhere, it is identical
    // to adding .where({ name: new RegExp(name, 'i')}
    // to that query.
    return this.where({username: new RegExp(username, 'i')});
};

module.exports = mongoose.model("User", userSchema);
