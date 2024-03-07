// jwt to save the tokeen in the cookie
var jwt = require('jsonwebtoken');

// import shcema from models/ userAuthSchema
const userAuth = require("../models/userAuthSchema");

// check if the token saved in the browser or not  function to protect routes 
const tokencheking= (req,res,next ) => {
  
    // get token from the browser pay attention !!!(req.cookies.jwt not res.cookies.jwt)==============
   const token = req.cookies.jwt
  
  
   if(token){
  
    // Verify if the token doesn't have any problems 
  
    jwt.verify(token , process.env.SECRET_JWT , (error) => {
      if(error){
        console.log(error)
        res.redirect('/login')
      }else{
          console.log("yes the tooken exist on the browser and not erro ")
          next()
      }
      
    })
    console.log("yes the tooken exist on the browser ")
   
   }else{
    console.log('no the tooken not exist ')
    res.redirect('/login')
   }
  
   }


  //  check if the user and send the user info to client  depend on the token that save the id of the current user
const checkIfUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.SECRET_JWT , async (err, decoded) => {
      if (err) {
        res.locals.UserInfo = null;
        next();
      } else {
        // decoded contain a id for current user 
        const thisUser = await userAuth.findById(decoded.userId);
        // send userinfo variable to client side
        res.locals.UserInfo = thisUser;
        
        next();
      }
    });
  } else {
    res.locals.UserInfo = null;
    next();
  }
  next()
};



  module.exports={tokencheking,checkIfUser}