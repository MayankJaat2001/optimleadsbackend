const mongoose = require("mongoose");

const BrokerSchema = mongoose.Schema(
{
    user_id: {
        type: String,
        required: true
    },
    brokerName: {
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
    brokerCompanyName: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    spent: {
        type: String,
        required: true,
        default: '0'
    },
    brokerEmail: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Compound index to enforce uniqueness of brokerPhone and brokerEmail within each user_id
BrokerSchema.index({ user_id: 1, brokerPhone: 1, brokerEmail: 1 }, { unique: true });

const Broker = mongoose.model("Broker" , BrokerSchema);

module.exports = Broker;
