const Admin = require('../models/adminModel');
const User = require('../models/userModel');





//login page load
const loadLogin = async (req, res) => {
    try{
        res.render('adminLogin');
    }
    catch (err) {
        console.log(err.message);
    }
}


//verify admin
const verifyAdmin = async (req, res) => {
    try{
        const admin = await Admin.find({email: req.body.email});
        if(admin.length > 0){
            if(admin[0].password == req.body.password){
                req.session.admin = admin[0].name;
                res.sendStatus(200)
            }
            else{
                res.status(400).json({error: 'Incorrect Password'})
            }
        }
        else{
            res.status(400).json({error: 'Admin not found'});
        }
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({error: 'Internal server error'});
    }
}


//dashboard page load
const loadDashboard = async (req, res) => {
    try{
        res.render('adminDashboard', { name: req.session.admin });
    }
    catch (err) {
        console.log(err.message);
    }
}


//users page load
const loadUsers = async (req, res) => {
    try{
        let search = req.query.search;
        let query = {};
        if (search) {
        query = {
            $or: [
            { first_name: { $regex: search, $options: "i" } },
            { last_name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            ],
        };
        }

        const users = await User.find(query);
        res.render('users', {users: users, search: search, name: req.session.admin});
    }
    catch(err) {
        console.log(err.message);
    }
}



//block or unblock user
const blockUser = async (req, res) => {
    try{
        await User.findByIdAndUpdate(req.query.userId, req.body);
        if(req.session.user && req.query.userId == req.session.user){
            delete req.session.user
        }
        res.sendStatus(200);
    }
    catch (err) {
        console.log(err.message);
        res.sendStatus(500);
    }
}


//logout
const logout = async (req, res) => {
    try{
        delete req.session.admin;
        res.redirect('/admin');
    }
    catch (err) {
        console.log(err.message);
    }
}



module.exports = {
    loadLogin,
    verifyAdmin,
    loadDashboard,
    loadUsers,
    blockUser,
    logout,
}