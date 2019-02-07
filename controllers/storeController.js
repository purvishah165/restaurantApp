const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter(req, file, next){
        const isPhoto = file.mimetype.startsWith('image/');
        if(isPhoto) {
            next(null, true);
        } else {
            next({message: 'That filetype isn\'t allowed'}, false);
        }

    }
}
exports.homePage = (req, res) =>{
    res.render('index')
}

exports.addStore = (req, res) => {
    res.render('addStore', { title: 'Add Store'})
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async(req, res, next)=> {
    //check if there is no file to resize
    if(!req.file) {
        next(); //skip to next middleware
        return;
    }
    const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
    // now we resize
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(150, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);
    next();
}

exports.createStore = async (req, res) => {
    console.log('hiiiiiiiii')
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
    //set location type to Point coz on update it doesnt set
    req.body.location.type = 'Point';
    //find and update the store
    const store = await Store.findOneAndUpdate({_id: req.params.id}, req.body, {
        new: true, // return the new updated store
        runValidators: true //force to run the validation of schema which just runs by defualt on create and not on save
    }).exec();
    req.flash('success', `Successfully updated <strong>${store.name}</strong><a href="/stores/${store.slug}"> View Store</a>`)
    res.redirect(`/stores/${store._id}/edit`)
}
exports.getStoreBySlug = async (req, res, next) => {
    const store = await Store.findOne({slug: req.params.slug});
    if(!store) return next();
    res.render('store',{store, title: store.name});

}

exports.getStoresByTag = async (req, res) => {
    const tag = req.params.tag
    const tagQuery = tag || {$exists: true};
    const tagsPromise = Store.getTagsList();
    const storePromise = Store.find({tags: tagQuery})
    const [tags, stores] = await Promise.all([tagsPromise, storePromise]);

    res.render('tags', {tags, title: 'Tags', tag, stores});

}
