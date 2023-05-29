let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let { Settings } = require('./SceneModel')

// let SaveSchema = new Schema({
//     'code': String,
//     'createTime': Date,
//     'updateTime': Date
// }, {_id : false});

let LessonSchema = new Schema({
	'name': { type: String, required: true },
	'prompt': String,
	'code': { type: String, required: true },
    'settings': Settings,
    // 'userCode': [SaveSchema]
}, {_id : false});

let CourseSchema = new Schema({
    'shortname': String,
    'name': String,
    'difficulty': Number,
    'description': String,
    'lessons': [LessonSchema]
});

module.exports = mongoose.model('Course', CourseSchema);