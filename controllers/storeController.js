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

exports.getStores = async(req, res)=> {
    // query to get all stores
    const stores = await Store.find();
    res.render('stores', {title: 'Stores', stores})
}

exports.editStore = async (req, res) => {
    // 1. find store with the given id
    const store = await Store.findOne({_id: req.params.id});
    // 2. confirm they are the owner of the store
    // TODO
    // 3. render edit form
    res.render('addStore', { title: 'Edit Store', store})
}

exports.updateStore = async (req,res) => {
    //find and update the store
    const store = await Store.findOneAndUpdate({_id: req.params.id}, req.body, {
        new: true, // return the new updated store
        runValidators: true //force to run the validation of schema which just runs by defualt on create and not on save
    }).exec();
    req.flash('success', `Successfully updated <strong>${store.name}</strong><a href="/stores/${store.slug}"> View Store</a>`)
    res.redirect(`/stores/${store._id}/edit`)
}
