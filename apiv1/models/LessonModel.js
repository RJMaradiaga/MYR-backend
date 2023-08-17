let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let { Settings } = require('./SceneModel');

let LessonSaveSchema = new Schema({
    'name': { type: String, required: true },
    'prompt': String,
    'code': { type: String, required: true },
    'settings': Settings,
    'course': { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    'user': { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('userLesson', LessonSaveSchema);