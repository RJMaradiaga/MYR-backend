let express = require('express');
let router = express.Router();
let SceneController = require('../controllers/SceneController.js');

router.get("/", SceneController.list);
router.post("/", SceneController.create);

router.delete("/:id", SceneController.delete);

module.exports = router;
