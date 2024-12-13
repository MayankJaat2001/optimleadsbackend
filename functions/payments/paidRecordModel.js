const mongoose = require('mongoose');

const paidRecordSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
},
  paymentId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

const PaidRecord = mongoose.model('PaymentRecords', paidRecordSchema);

module.exports = PaidRecord;
