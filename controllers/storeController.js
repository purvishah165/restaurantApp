const mongoose = require('mongoose');
const Store = mongoose.model('Store');
exports.homePage = (req, res) =>{
    res.render('index')
}

exports.addStore = (req, res) => {
    res.render('addStore', { title: 'Add Store'})
}

exports.createStore = async (req, res) => {
    // either wrap the whole function here in try catch or handle that in error handler which wraps the whole function
    const store = await(new Store(req.body)).save();
    req.flash('success', `Successfully Created ${store.name}.Care to leave a review?`);
    res.redirect(`/store/${store.slug}`);

}
