let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let SaveSchema = require('./CourseModel').model('SaveSchema').schema;

const UserSetting = {
    "fontSize": { type: Number, default: 12 }
};

const GoogleAccountSchema = new Schema({
    'email': String,
    'googleId': String,
    'userSettings': UserSetting,
    'courseSave': [SaveSchema]
});

module.exports = mongoose.model('GoogleLogin', GoogleAccountSchema);
