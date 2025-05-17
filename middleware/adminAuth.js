const isLogin = async (req, res, next) => {
    try {
        console.log(req.session.dd, 'req.session.dd', req.url, 'req.url')
        if (req.session.dd) {
            next()
        }
        else {
            console.log('is login pure function ', req.session.dd)
            res.redirect('/admin')
        }
    } catch (error) {
        console.log(error.message);
    }
}
const isLogout = async (req, res, next) => {
    try {
        if (req.session.dd) {
            console.log('req.session.dd', req.session.dd)
            res.redirect('/admin/dashboard')
        } else {

            next()
        }
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    isLogin,
    isLogout
}