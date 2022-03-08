const mongoose = require("mongoose");
const User = require("./Models/userModel");
const Order = require('./Models/orderModel');


let userNames = ["winnifred", "lorene", "cyril", "vella", "erich", "pedro", "madaline", "leoma", "merrill",  "jacquie", "pat"];
let users = [];

userNames.forEach(name =>{
	let u = new User();
	u._id = mongoose.Types.ObjectId();
	u.username = name;
	u.password = name;
	u.privacy = false;
	users.push(u);
});


mongoose.connect('mongodb://127.0.0.1/a4', {useNewUrlParser: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
	mongoose.connection.db.dropDatabase(function (err, result) {
		User.insertMany(users, function (err, result) {
			if (err) {
				console.log(err);
                return;
			}
			User.find().exec(function (err, result) {
				if (err) throw err;
				console.log(result);
				mongoose.connection.close()
			})
		})
	});
});
