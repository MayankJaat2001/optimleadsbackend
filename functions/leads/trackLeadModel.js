const mongoose = require('mongoose');

// Define the schema for the data
const SentLeadDataSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  leadEmail: {
    type: String,
    required: true
  },
  brokerEmail: {
    type: String,
    required: true
  }
});

// Create the model using the schema
const sentLead = mongoose.model('SentLeadData', SentLeadDataSchema);

module.exports = sentLead;
