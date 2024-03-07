

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
 
// define the Schema (the structure of the article)
const accountSchema = new Schema({
    platform: String,
    catigory: String,
    country: String,
    accounts: String,
},
{ timestamps: true }
);
 
 
// Create a model based on that schema
const Accounts = mongoose.model("accsData", accountSchema);
 
 
// export the model
module.exports = Accounts;