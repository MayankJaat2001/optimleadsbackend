const express = require("express");
const router = express.Router();

const brokersController = require("./brokersController");

router.post("/create" , brokersController.create);
router.get("/getBrokers" , brokersController.getBrokers);
router.post("/deleteBroker" , brokersController.deleteBroker);
router.get("/getBrokerProfile" , brokersController.getBrokerProfile); // editBrokerProfile
router.post("/editBrokerProfile" , brokersController.editBrokerProfile);
// router.post("/login" , leadsController.login )


module.exports = router;