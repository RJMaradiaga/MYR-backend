let CourseModel = require('../models/CourseModel');
//let { LessonSaveSchema } = require('../models/courseModel');
let verify = require('../authorization/verifyAuth.js');

/**
 * CourseController.js
 *
 * @description :: Server-side logic for managing Courses.
 */
module.exports = {

    /**
     * CourseController.list()
     */
    list: function (req, res) {
        let lessons = req.query.lessons ? { lessons: req.query.lessons } : null;
        let difficulty = req.query.difficulty ? { difficulty: req.query.difficulty } : null;

        let filter;
        // let sort;
        let range;
        let pageSize;
        let currentPage;
        let docConditions;
        let pageRange;
        if (req.query.filter != undefined) {
            filter = JSON.parse(req.query.filter);
        }
        // if (req.query.sort != undefined) {
        //     sort = JSON.parse(req.query.sort);
        // }
        if (req.query.range != undefined) {
            range = JSON.parse("\"" + req.query.range + "\"").split("[");
            range.splice(0, 1);
            range = range[0].split("]");
            range.splice(1, 1);
            range = range[0].split(",");
            pageSize = range[1];
            currentPage = range[0];
        }
        if (pageSize != undefined && currentPage != undefined) {
            pageRange = {
                'skip': (pageSize * (currentPage - 1)),
                'limit': Number(pageSize)
            };
        }

        docConditions = { ...pageRange };

        let queryParams = { ...lessons, ...difficulty, ...filter };

        CourseModel.find(queryParams, {}, docConditions, function (err, Course) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Course.',
                    error: err
                });
            }
            if (!Course) {
                return res.status(404).json({
                    message: 'No such Course'
                });
            }
            CourseModel.countDocuments(queryParams).exec(function (err, count) {
                if (err) {
                    return next(err);
                }
                res.set('Total-Documents', count);
                return res.json(Course);
            });
        });
    },

    /**
     * CourseController.show()
     */
    show: function (req, res) {
        let id = req.params.id;
        let getLesson = req.query.getLesson ? req.query.getLesson : false;
        CourseModel.findOne({ _id: id }, function (err, Course) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Course.',
                    error: err
                });
            }
            if (!Course) {
                return res.status(404).json({
                    message: 'No such Course'
                });
            }
            return res.json(Course);
        });
    },

    /**
     * CourseController.show_via_shortname()
     */
    show_via_shortname: function (req, res) {
        let shortname = req.params.shortname;
        let getLesson = req.query.getLesson ? req.query.getLesson : false;
        CourseModel.findOne({ shortname: shortname }, function (err, Course) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Course.',
                    error: err
                });
            }
            if (!Course) {
                return res.status(404).json({
                    message: 'No such Course'
                });
            }
            return res.json(Course);
        });
    },

    /**
    * CourseController.create()
    */
    create: function (req, res) {
        let newCourse = new CourseModel({
            name: req.body.name,
            shortname: req.body.shortname,
            lessons: req.body.lessons,
            difficulty: req.body.difficulty,
            description: req.body.description,
            lessons: req.body.lessons
        });
        let token = req.headers['x-access-token'];

        verify.isAdmin(token).then(function (answer) {
            if (!answer) {
                res.status(401).send('Error 401: Not authorized');
            }
            else {
                CourseModel.findOne({ shortname: req.body.shortname }, function (err, Course) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when creating course.',
                            error: err
                        });
                    }
                    if (Course != null) {
                        return res.status(409).json({
                            message: 'A course with this shortname already exists',
                        });
                    }
                    else {
                        Course = newCourse;
                        Course.save(function (err, Course) {
                            if (err) {
                                return res.status(500).json({
                                    message: 'Error when creating course',
                                    error: err
                                });
                            }
                            return res.status(201).json(Course);
                        });
                    }
                });
            }
        });
    },

    /**
     * CourseController.update()
     */
    update: function (req, res) {
        let token = req.headers['x-access-token'];

        verify.isAdmin(token).then(function (answer) {
            if (!answer) {
                res.status(401).send('Error 401: Not authorized');
            }
            else {
                let id = req.params.id;
                CourseModel.findOne({ _id: id }, function (err, Course) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when getting course',
                            error: err
                        });
                    }
                    if (!Course) {
                        return res.status(404).json({
                            message: 'No such course'
                        });
                    }

                    //Course = { ...Course, }
                    Course.name = req.body.name ? req.body.name : Course.name;
                    Course.shortname = req.body.shortname ? req.body.shortname : Course.shortname;
                    Course.lessons = req.body.lessons ? req.body.lessons : Course.lessons;
                    Course.difficulty = req.body.difficulty ? req.body.difficulty : Course.difficulty;
                    Course.description = req.body.description ? req.body.description : Course.description;
                    Course.lessons = req.body.lessons ? req.body.lessons : Course.lessons;

                    Course.save(function (err, Course) {
                        if (err) {
                            return res.status(500).json({
                                message: 'Error when updating Course.',
                                error: err
                            });
                        }

                        return res.json(Course);
                    });
                });
            }
        });
    },
    
    /**
     * CourseController.saveLesson()
     */
    saveLesson: async function(req, resp){
        let id = req.params.id;
        let body = req.body;

        if(!req.headers['x-access-token']){
            return resp.status(400).json({
                message: "Missing user ID",
                error: "Bad Request"
            });
        }

        if(Object.keys(body) === 0 || body.settings === undefined){
            return resp.status(400).json({
                message: "Missing required fields",
                error: (Object.keys(body) == 0 ? "No body provided" : "No settings provided")
            });
        }
        
        let uid = await verifyGoogleToken(req.headers['x-access-token']);
        if(!uid){
            return resp.status(401).json({
                message: "Invalid token recieved",
                error: "Unauthorized"
            });
        }
        courseSave.uid = uid;

        let courseSave;
        try{
            courseSave = await CourseSchema.findById(id);
        }catch(err){
            return resp.status(500).json({
                message: "Error getting course save",
                error: err
            });
        }
        
        if(!courseSave){
            return resp.status(404).json({
                message: `Could not find course save "${id}"`,
                error: "Course save not found"
            });
        }
        else if(courseSave.uid.toString() !== uid.toString()){
            return resp.status(401).json({
                message: `You do not own course save "${id}"`,
                error: "Unauthorized"
            });
        }

        if (body.createTime === undefined) {
            courseSave.createTime = new Date();
        }
        courseSave.name = body.name;
        courseSave.code = body.code;
        courseSave.settings = body.settings;
        courseSave.updateTime = new Date();

        try{
            await courseSave.save();
        }catch(err){
            return resp.status(500).json({
                message: "Error updating course save",
                error: err
            });
        }
        return resp.json(courseSave); //No Content
    },


    /**
     * CourseController.getByID()
     */
    getByID: async function(req, res){
        let id = req.params.id;

        let lessonSave;

        try{
            lessonSave = await LessonSaveSchema.findById(id);
        }catch(err) {
            //Might be a firebase ID
            try{
                lessonSave = await LessonSaveSchema.findOne({firebaseID: id});
            }catch(err){
                return res.status(500).json({
                    message: "Error Fetching lesson save",
                    error: err
                });
            }            
        }
        //Not found
        if(!lessonSave){
            return res.status(404).json({
                message: `Could not find lesson save ${id}`,
                error: "Lesson save not found"
            });
        }
        if(lessonSave._id.toString() !== id){
            return res.redirect(301, `${scene._id}`);
        }

        return res.status(200).json(lessonSave);
    },

    /**
     * CourseController.remove()
     */
    remove: function (req, res) {
        let token = req.headers['x-access-token'];

        verify.isAdmin(token).then(function (answer) {
            if (!answer) {
                res.status(401).send('Error 401: Not authorized');
            }
            else {
                let id = req.params.id;
                CourseModel.findByIdAndRemove(id, function (err, Course) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when deleting the Course.',
                            error: err
                        });
                    }
                    return res.status(204).json(Course);
                });
            }
        });

    },
};