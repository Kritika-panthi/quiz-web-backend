var express = require('express');
const { createUser, LoginUserController, getUserListController, updateProfileMeController, viewMyProfileController, viewProfileofUserController} = require('../controller/userController');
const { validateTokenMiddleware } = require('../middleware/AuthMiddleware');
const uploadMiddleware = require('../middleware/FileHandleMiddleware');
var router = express.Router();

/* GET users listing. */

router.get("/", function (req, res) {
  res.json({
    message: "User Controller is working",
  });
});

router.post('/create', createUser);

router.post('/login', LoginUserController);

router.get('/list', validateTokenMiddleware, getUserListController);

router.put(
  '/profile', 
  validateTokenMiddleware, 
  uploadMiddleware.single("profileIMG"), 
  updateProfileMeController
);
router.get('/profile/me', validateTokenMiddleware, viewMyProfileController);
router.get(
  '/profile/:id', validateTokenMiddleware, viewProfileofUserController);

module.exports = router;
