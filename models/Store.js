const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Please enter store name !'
    },
    slug: String,
    description: {
        type: String,
        trim: true
    },
    tags: [String]
});

// method to run before saving into model
storeSchema.pre('save', function(next){
    if(!this.isModified('name')){
        next();
        return; //if name is not modified stop this function
    }
    this.slug = slug(this.name);
    next();
    // TODO make slug more unique
})
module.exports = mongoose.model('Store', storeSchema)
