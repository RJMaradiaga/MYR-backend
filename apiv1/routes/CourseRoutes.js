let express = require('express');
let router = express.Router();
let CourseController = require('../controllers/CourseController.js');

router.get('/', CourseController.list);

router.get('/:shortname', CourseController.show_via_shortname);

router.get('/id/:id', CourseController.show);

router.post('/', CourseController.create);

router.put('/id/:id', CourseController.update);

router.delete('/id/:id', CourseController.remove);

router.put('/saveLesson', CourseController.saveLesson);

router.get('/saveId/:id', CourseController.getByID);

module.exports = router;
