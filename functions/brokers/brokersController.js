const User = require("../user/user_model");
const Broker = require("./brokersModel");

// Create Brokers

const create = async (req , res ) =>{
  console.log("Data::",req.body)
  try {
      const {user_id , brokerName , brokerEmail , brokerPhone , companyName ,  location , spent} = req.body;

      if(!brokerName || !brokerEmail  || !brokerPhone || !companyName || !location || !user_id)
          return res.json({
              status: 0,
              message: "All fields are mandatory!"
          });
      
      const BrokerByUserid = await User.findOne({_id: user_id});
      if(!BrokerByUserid){
          return res.json({
              status: 0,
              message: "Invalid User ID",
          });
      }
      const findBrokerByPhone = await Broker.findOne({ user_id: user_id, brokerPhone: brokerPhone });
      if (findBrokerByPhone) {
        return res.json({
          status: 0,
          message : "Broker with this phone number already exists!"
        })
      } 
      const findBrokerByEmail= await Broker.findOne({ user_id: user_id, brokerEmail: brokerEmail });
      if (findBrokerByEmail) {
        return res.json({
          status: 0,
          message : "Broker with this Email ID already exists!"
        })
      } 
      const user = await Broker.create({
          user_id: user_id,
          brokerName: brokerName,
          brokerEmail: brokerEmail,
          brokerPhone: brokerPhone,
          spent: spent,
          brokerCompanyName: companyName,
          location: location,
      });

      return res.json({
          status: 1,
          message: "Broker Added",
      });

  } catch(error) {
      // Check for duplicate key error and return appropriate response
      if (error.code === 11000 && error.keyPattern && error.keyPattern.user_id && error.keyPattern.brokerPhone && error.keyPattern.brokerEmail) {
          return res.status(200).json({
              status: 0,
              message: "Broker with this credentials already exists!"
          });
      }

      return res.status(500).json({
          status: 0,
          message: error.message
      });
  }
};

const getBrokers = async (req, res) => {
  try {
    const user_id = req.query.user_id;
    console.log("User -- " , user_id);
    const getBrokerInfo = await Broker.find( { user_id: user_id });
    console.log("Get Broker Info -- -- " , getBrokerInfo);
    if(!getBrokerInfo){
      res.status(200).json({
        status: 0,
        message : 'Broker not found!'
      })
    }
    res.status(200).json({
      status: 1,
      data: getBrokerInfo,
    });
  } catch (error) {
    return res.status(500).json({
      status: 0,
      message: error.message,
    });
  }
};

// get Broker Profile 

const getBrokerProfile = async (req, res) => {
  try {
    const broker_id = req.query.broker_id;
    const getBrokerInfo = await Broker.find({ _id: broker_id});
    
    res.status(200).json({
      status: 1,
      data: getBrokerInfo[0],
    });
  } catch (error) {
    return res.status(500).json({
      status: 0,
      message: error.message,
    });
  }
};

// Edit Profile

const editBrokerProfile = async (req, res) => {
  try {
    const brokerId = req.query.broker_id;
    const { brokerName, brokerEmail, brokerPhone , location} = req.body;

    if (!brokerName || !brokerEmail || !brokerPhone  ||  !location) {
      return res.json({
        status: 0,
        message: "All fields are mandatory!"
      });
    }

    const existingBroker = await Broker.findById(brokerId);

    if (!existingBroker) {
      return res.json({
        status: 0,
        message: "Broker not found"
      });
    }

    // Check if the provided email or phone already exists for another user
    existingBroker.brokerName = brokerName;
    existingBroker.brokerPhone = brokerPhone;
    existingBroker.location = location;
    existingBroker.createdAt = Date.now();

    await existingBroker.save();

    return res.json({
      status: 1,
      message: "Broker Details updated successfully"
    });
  } catch (error) {
    return res.status(500).json({
      status: 0,
      message: error.message
    });
  }
};

// Delete Broker 

const deleteBroker = async (req, res) => {
  try {
    const deleteRequests = req.body;

    if (!Array.isArray(deleteRequests) || deleteRequests.length === 0) {
      return res.json({
        status: 0,
        message: "No delete requests provided."
      });
    }

    
    const brokerEmails = [];
    const userIds = [];

    deleteRequests.forEach(request => {
      if (request.brokerEmails && request.userIds) {
        brokerEmails.push(request.brokerEmails);
        userIds.push(request.userIds);
      }
    });

    const deletionResult = await Broker.deleteMany({ brokerEmail: { $in: brokerEmails }, user_id: { $in: userIds } });

    if (deletionResult.deletedCount === 0) {
      return res.json({
        status: 0,
        message: "No Broke found with provided Broker emails and user IDs."
      });
    }

    return res.json({
      status: 1,
      message: `${deletionResult.deletedCount} Broker(s) deleted successfully.`
    });
  } catch (error) {
    // Handle errors
    return res.status(500).json({
      status: 0,
      message: error.message
    });
  }
};


module.exports = {
    create,
    getBrokers,
    deleteBroker,
    getBrokerProfile,
    editBrokerProfile
}