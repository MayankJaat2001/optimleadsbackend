const User = require("./user_model");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const generateOTP = require("./OTPValidation.js/otpgenerator");
const OTP = require("./OTPValidation.js/otpModal");

const transporter = nodemailer.createTransport({
  service:'gmail',
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});


// Register 

const register = async (req , res ) =>{
    try{
        console.log("RUnning 1")
        const {firstName , lastName , phone , email , password} = req.body;

        console.log("Firstname -- " , firstName , " Lastname -- " , lastName , " - Phone - " , phone , " email " , email)
        console.log("RUnning 2" , req.body)
        if(!firstName || !lastName  || !phone || !email)
        return res.json({
             status: 0,
             message: "All fields are mandatory!"
        });
        console.log("RUnning ")


        const findUserByPhone = await User.findOne({phone: phone});
        if (findUserByPhone)
      return res.json({
        status: 0,
        message: "Phone no is already registered!",
      });

      const findUserByEmail = await User.findOne({email: email});

      if(findUserByEmail)
      return res.json({
       status: 0,
       message: "Email is already registered!"})

       let encryptedPassword = await bcrypt.hash(password, 10);

       const user = await User.create({
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        email: email,
        password: encryptedPassword
       });

       return res.json({
        status: 1,
        message: "Registration done !",
        username: user?.firstName,
        user_id: user?._id
      });

    }catch(error){
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
}

// User Login 

const login = async (req , res ) =>{
  console.log("Login found !")
  try{
    const {emailMob  , password} = req.body;
    if(!emailMob || !password) {
      return res.json({
        status: 0,
        message : "E mail and Password is required!"
      })
    }

    let user;

    user = await User.findOne({phone: emailMob })

    if(!user){
      user = await User.findOne({email : emailMob})
    }

    if(!user){
      return res.status(404).json({
        status: 0,
        message: "User not found"
      })
    }

    const comparedPassword = await bcrypt.compare(password , user.password)

    if(!comparedPassword){
      return res.json({
        status: 0,
        message: "Invalid Password!"
      })
    }

    return res.json({
      status: 1,
      user_id: user?._id,
      user_name : user?.firstName,
      message: "Welcome!"
    })
  }catch (error){
    return res.json({
      status: 0,
      message : error.message
    })
  }
}

// get User Info

const getProfile = async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const getAccountInfo = await User.find({ _id: user_id,});
    
    res.status(200).json({
      status: 1,
      data: getAccountInfo[0],
    });
  } catch (error) {
    return res.status(500).json({
      status: 0,
      message: error.message,
    });
  }
};

// Edit Profile

const editProfile = async (req, res) => {
  try {
    const userId = req.query.userId;
    const { firstName, lastName, phone, email } = req.body;

    if (!firstName || !lastName || !phone || !email) {
      return res.json({
        status: 0,
        message: "All fields are mandatory!"
      });
    }

    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return res.json({
        status: 0,
        message: "User not found"
      });
    }

    // Check if the provided email or phone already exists for another user
    const userWithSameEmail = await User.findOne({ email: email, _id: { $ne: userId } });
    if (userWithSameEmail) {
      return res.json({
        status: 0,
        message: "Email is already registered!"
      });
    }

    const userWithSamePhone = await User.findOne({ phone: phone, _id: { $ne: userId } });
    if (userWithSamePhone) {
      return res.json({
        status: 0,
        message: "Phone number is already registered!"
      });
    }

    // Update user's profile information
    existingUser.firstName = firstName;
    existingUser.lastName = lastName;
    existingUser.phone = phone;
    existingUser.email = email;
    existingUser.createdAt = Date.now();

    await existingUser.save();

    return res.json({
      status: 1,
      message: "Profile updated successfully"
    });
  } catch (error) {
    return res.status(500).json({
      status: 0,
      message: error.message
    });
  }
};


// Change Password

const changePassword = async (req, res) => {
  try {
    const userId = req.query.userId;
    const newPassword = req.query.newPassword;

    const user = await User.findById(userId);

    if (!user) {
      return res.json({
        status: 0,
        message: "User not found"
      });
    }

    // Hash the new password
    const encryptedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    user.password = encryptedPassword;
    await user.save();

    return res.json({
      status: 1,
      message: "Password changed successfully"
    });
  } catch (error) {
    return res.status(500).json({
      status: 0,
      message: error.message
    });
  }
};


//  SEND OTP 

const sendOTP = async (req, res) => {
  try {
    const email = req.query.email;
    const phone = req.query.phone;

    const findPhone = await User.findOne({phone: phone })
    const findEmail = await User.findOne({email: email });

    if(findPhone){
      return res.json({
        status: 0,
        message: "Phone number already exists!"
      })
    }

    if(findEmail){
      return res.json({
        status: 0,
        message: "Email ID already exists!"
      })
    }

    const otp = generateOTP();

    await OTP.create({
      email: email,
      phone: phone,
      otp: otp
    });

    var mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: "OTP for OptimLeads Validation",
      text: `Your OTP for Email Verification is ${otp}`
    };

    await new Promise((resolve, reject) => transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log('send main Error ', error);
        reject(error); // Reject the promise if there's an error
      } else {
        console.log("Email Sent Successfully!");
        resolve(); // Resolve the promise if email is sent successfully
      }
    }));
    
    
    res.status(200).json({
      status: 1,
      message: 'OTP Sent Successfully'
    });
  } catch (error) {
    return res.status(500).json({
      status: 0,
      message: error.message,
    });
  }
};

// Resend OTP

const resendOTP = async (req, res) => {
  try {
    const email = req.query.email;

    const otp = generateOTP();

    await OTP.create({
      email: email,
      otp: otp
    });

    var mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: "OTP for OptimLeads Validation",
      text: `Your OTP for Email Verification is ${otp}`
    };

    await new Promise((resolve, reject) => transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log('send main Error ', error);
        reject(error); // Reject the promise if there's an error
      } else {
        console.log("Email Sent Successfully!");
        resolve(); // Resolve the promise if email is sent successfully
      }
    }));

    
    
    res.status(200).json({
      status: 1,
      message: 'OTP Sent Successfully'
    });
  } catch (error) {
    return res.status(500).json({
      status: 0,
      message: error.message,
    });
  }
};
const resetPassword = async (req, res) => {
  try {
    const email = req.query.email;
    const otp = req.query.otp;
    const newPass = req.query.newPass;

    if(!email || !otp  || !newPass)
    return res.json({
         status: 0,
         message: "All fields are mandatory!"
    });


    const findEmail = await User.findOne({email: email });

    if(!findEmail){
      return res.json({
        status: 0,
        message: "User doesnot exist!"
      })
    }

    const otpRecord = await OTP.findOne({ email,  otp });

    if (!otpRecord) {
      return res.json({
        status: 0,
        message: "Invalid OTP"
      });
    }

    // Reset password
    const encryptedPassword = await bcrypt.hash(newPass, 10);
    await User.updateOne({ email: email }, { password: encryptedPassword });

    return res.json({
      status: 1,
      message: "Password reset successful.",
    });
  } catch (error) {
    return res.status(500).json({
      status: 0,
      message: error.message,
    });
  }
};
// Validate OTP
const validateOTP = async (req, res) => {
  try {
    const email = req.query.email;
    const otp = req.query.otp;

    console.log("- " , email , " - " , otp)

    // Find OTP by email and phone
    const otpRecord = await OTP.findOne({ email,  otp });

    if (!otpRecord) {
      return res.json({
        status: 0,
        message: "Invalid OTP or email/phone!"
      });
    }

    // OTP is valid
    // You can delete the OTP record from the database after successful validation if required

    return res.json({
      status: 1,
      message: "OTP validated successfully!"
    });
  } catch (error) {
    return res.status(500).json({
      status: 0,
      message: error.message,
    });
  }
};



module.exports = {
    register,
    login,
    getProfile,
    sendOTP,
    validateOTP,
    changePassword,
    editProfile,
    resetPassword,
    resendOTP
}