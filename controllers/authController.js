const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const crypto = require('crypto');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail')

exports.login = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Failed Login!',
    successRedirect: '/',
    successFlash: 'You are now logged in!'
});

exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'You are now logged out! 👋');
    res.redirect('/');

};

exports.isLoggedIn = (req, res, next) => {
    //1. check if user is logged in
    if (req.isAuthenticated()) {
        next();
        return;
    }
    req.flash('error', 'You must be logged in to do that!');
    res.redirect('/login');
};

exports.forgot = async(req, res) => {
    //1. see if user with that email exists
    const user = await User.findOne({email: req.body.email});
    if(!user) {
        req.flash('error', 'No account with that email exists.') // for security its better to send msg as password reset has been emailed
        return res.redirect('/login');
    }
    //2. set reset tokens and expiry on their account
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
    //3. send them email with token
    const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
    await mail.send({
        user,
        subject: 'Password Reset',
        resetURL,
        filename: 'password-reset'
    });
    req.flash('success', `You have been emailed a password reset link.`);
    //4. redirect to login
    res.redirect('/login');


};
exports.reset = async(req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {$gt: Date.now()}
    });
    if(!user) {
        req.flash('error', 'Password reset link is invalid or has been expired.') // for security its better to send msg as password reset has been emailed
        return res.redirect('/login');
    }
    //if there is a user show the password reset form
    res.render('reset', {title: 'Reset your Password'});

};
exports.confirmedPasswords = (req, res, next) => {
    if (req.body.password === req.body['password-confirm']) {
        next(); //keep going
        return;
    }
    req.flash('error', 'Passwords do not match.')
    res.redirect('back');
}

exports.update = async(req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {$gt: Date.now()}
    });
    if(!user) {
        req.flash('error', 'Password reset link is invalid or has been expired.') // for security its better to send msg as password reset has been emailed
        return res.redirect('/login');
    }

    const setPassword = promisify(user.setPassword, user);
    await setPassword(req.body.password);
    user.resetPasswordExpires = undefined;
    user.resetPasswordToken = undefined;
    const updatedUser = await user.save();
    await req.login(updatedUser);
    req.flash('success', '💃 Nice! Your password has been reset! You are now logged in!') // for security its better to send msg as password reset has been emailed
    return res.redirect('/');
}
