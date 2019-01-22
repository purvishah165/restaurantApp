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
    tags: [String],
    created: {
        type: Date,
        default: Date.now
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [{
            type: Number,
            required: 'You must supply coordinates!'
        }] ,
        address: {
            type: String,
            required: 'You must supply address!'
        }
    },
    photo: String
});

// method to run before saving into model
storeSchema.pre('save', async function(next){
    if(!this.isModified('name')){
        next();
        return; //if name is not modified stop this function
    }
    this.slug = slug(this.name);
    // find other stores that have same slug
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const storeWithSlug = await this.constructor.find({slug: slugRegEx});
    if(storeWithSlug.length) {
        this.slug = `${this.slug}-${storeWithSlug.length + 1}`;
    }
    next();
    // TODO make slug more unique
})
module.exports = mongoose.model('Store', storeSchema)
