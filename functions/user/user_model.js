const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
{
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
          validator: function (v) {
            return v.length === 10;
          },
          message: (props) => `${props.value} is not a valid mobile number1!`,
        },
      },
      email: {
        type: String,
        unique: true,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
    { timeStamp: true }
);

const User = mongoose.model("User" , userSchema);

module.exports = User;