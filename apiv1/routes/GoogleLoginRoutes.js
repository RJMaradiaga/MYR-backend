let express = require('express');
let router = express.Router();
const GoogleLoginController = require('../controllers/GoogleLoginController');

router.get('/', GoogleLoginController.list);

router.get('/id/:id', GoogleLoginController.getByID);

router.get('/settings', GoogleLoginController.getUserSetting);

router.put('/settings', GoogleLoginController.updateUserSetting);

router.get('/courses', GoogleLoginController.getUserCourses);

router.put('/courses', GoogleLoginController.updateUserCourses);

module.exports = router;