const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs'); // Import bcryptjs instead of crypto

// define the Schema (the structure of the authuser)
const userauthSchema = new Schema({
    username: String,
    email: String,
    password: String,
});

userauthSchema.pre("save", async function(next) {
    if (!this.isModified('password')) return next();

    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(10); // You can adjust the cost factor (10) as needed
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(this.password, salt);

        // Set the hashed password to the schema
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

// Create a model based on that schema
const userAuth = mongoose.model("userAuthdata", userauthSchema);

// export the model
module.exports = userAuth;
