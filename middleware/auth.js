const User=require('../models/userModel')

const isLoggedIn = async (req, res, next) => {
    try {
        if(req.session.user_id){
            // next()
            console.log('loggedin true');
            res.locals.loggedIn=true
           
            
        }else{
            // res.redirect('/')
            console.log('logged in false');
            res.locals.loggedIn=false;
            
        }
    } catch (error) {
        console.log(error.message);
    }
    next()
}

const isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {

            next()
        }
        else {
            res.redirect('/')
        }

    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            res.redirect('/home')
        } else {
            next()
        }

    } catch (error) {
        console.log(error.message);
    }
}


module.exports={
    isLoggedIn,
    isLogin,
    isLogout
    
   
}