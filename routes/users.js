const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');

const users = require('../controllers/users');
const { route } = require("express/lib/application");


// group routes
router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);


// router.get('/register', users.renderRegister)

// router.post('/register', catchAsync(users.register));


// router.get('/login', users.renderLogin)

// router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

router.get('/logout', users.logout)

module.exports = router;