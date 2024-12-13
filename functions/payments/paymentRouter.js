const express = require("express");
const router = express.Router();

const paymentController = require("./paymentController");

router.post("/createRecord" , paymentController.createRecord);
router.get("/getPayments" , paymentController.getPayments)
router.get("/updateRecord" , paymentController.updateRecord)
router.get("/getPaymentRecords" , paymentController.getPaymentRecords)
router.get("/getPaymentAccordingToMonth" , paymentController.getPaymentAccordingToMonth)
router.get("/sumAmount" , paymentController.sumAmount) //sumAmount
// router.post("/login", userController.login);

module.exports = router;