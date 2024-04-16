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


const isActive=async(req,res,next)=>{
    try {

        if(req.session.user_id){
        const user=await User.findById(req.session.user_id)
            if(user.is_active===false){
                console.log(user.is_active,'isActive in currenct user');
                delete req.session.user_id
                res.redirect('/home')
            }else{
                next()
            }
        }else{
            res.redirect('/home')
        }
    } catch (error) {
        console.error('Error founded isActive ',error);
    }
}

module.exports={
    isLoggedIn,
    isLogin,
    isLogout,
    isActive
    
   
}