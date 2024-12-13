const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema(
{
    user_id: {
        type: String,
        required: true
    },
    brokerName: {
        type: String,
        required: true
    },
    brokerEmail: {
            type: String,
            required: true
    },
    brokerPhone: {
        type: String,
        required: true,
        trim: true,
        validate: {
          validator: function (v) {
            return v.length === 10;
          },
          message: (props) => `${props.value} is not a valid mobile number!`,
        },
    },
    amount:{
        type: Number,
        required: true
    },
    status:{
        type: String,
        required: true
    },
    notes:{
        type: String,
        required: false
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
      },
});

const Payment = mongoose.model("Payments" , paymentSchema);

module.exports = Payment;