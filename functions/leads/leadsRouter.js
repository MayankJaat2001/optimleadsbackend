const express = require("express");
const router = express.Router();

const leadsController = require("./leadsController");

router.post("/create" , leadsController.create);
router.get("/getLeads" , leadsController.getLeads )
router.get("/trackSentLead" , leadsController.trackSentLead );
router.post("/deleteLead" , leadsController.deleteLead );
router.post('/sendEmailLead' , leadsController.sendEmailLead);
router.post('/createLeadCSV' , leadsController.createLeadCSV);


module.exports = router;