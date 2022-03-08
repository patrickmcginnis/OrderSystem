const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let orderSchema = Schema({
    customer: {
        type: Schema.Types.ObjectId, ref: 'User'
    },
    restaurantName: {
        type: String,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    fee: {
        type: Number,
        required: true},
    tax: {
        type: Number,
        required: true
    },
    order: {}
});

module.exports = mongoose.model("Order", orderSchema);