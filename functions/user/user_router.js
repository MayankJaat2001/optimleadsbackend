const express = require("express");
const router = express.Router();

const userController = require("./user_controller");

router.post("/register" , userController.register);
router.post("/login" , userController.login )
router.get("/getProfile" , userController.getProfile)
router.get("/sendOTP" , userController.sendOTP)
router.get("/validateOTP" , userController.validateOTP)
router.get("/changePassword" , userController.changePassword)
router.post("/editProfile" , userController.editProfile)
router.get("/resetPassword" , userController.resetPassword)
router.get("/resendOTP" , userController.resendOTP)

// router.post("/login", userController.login); resetPassword resendOTP

module.exports = router;