const Broker = require("../brokers/brokersModel");
const PaidRecord = require("./paidRecordModel");
const Payment = require("./paymentModel");
const bcrypt = require("bcryptjs")

// Register 

const createRecord = async (req , res ) =>{
    try{
        console.log("RUnning 1")
        const {user_id , amount , status , notes , brokerEmail } = req.body;

        if(!brokerEmail || !amount  || !status || !user_id)
        return res.json({
             status: 0,
             message: "Broker name , amount , status is mandatory!"
        });

        const findBrokerByEmail= await Broker.findOne({ user_id: user_id, brokerEmail: brokerEmail });

        if(!findBrokerByEmail)
        return res.json({
             status: 0,
             message: "Invalid Broker"
        });
        console.log("RUnning 2" , findBrokerByEmail)
        
       const user = await Payment.create({
        user_id: user_id,
        brokerName: findBrokerByEmail.brokerName,
        brokerEmail:  findBrokerByEmail.brokerEmail,
        brokerPhone: findBrokerByEmail.brokerPhone,
        amount: amount,
        status: status,
        notes: notes
       });

       return res.json({
        status: 1,
        message: "Payment Added!",
      });

    }catch(error){
        return res.status(500).json({
            status: 0,
            message: error.message
        })
    }
}

//get Payment Details

const getPayments = async (req, res) => {
    try {
      const user_id = req.query.user_id;
      console.log("User -- " , user_id);
      const getPaymentInfo = await Payment.find( { user_id: user_id });
      console.log("Get Leads Info -- -- " , getPaymentInfo);
      if(!getPaymentInfo){
        res.status(200).json({
          status: 0,
          message : 'No records!'
        })
      }
      res.status(200).json({
        status: 1,
        data: getPaymentInfo,
      });
    } catch (error) {
      return res.status(500).json({
        status: 0,
        message: error.message,
      });
    }
  };



  // Paid Payments record 

  const getPaymentRecords = async (req, res) => {
    try {

      const user_id = req.query.user_id;

      const paymentRecord = await PaidRecord.find( { user_id: user_id });

      console.log("Get Leads Info -- -- " , paymentRecord);
      if(!paymentRecord){
        res.status(200).json({
          status: 0,
          message : 'User ID record found!'
        })
      }
      res.status(200).json({
        status: 1,
        data: paymentRecord,
      });
    } catch (error) {
      return res.status(500).json({
        status: 0,
        message: error.message,
      });
    }
  };
  // get payments record

  const getPaymentAccordingToMonth = async (req, res) => {
    try {
        const userId = req.query.userId;
        const date = req.query.date;

        // Parse the date string to extract month and year
        const [month, year] = date.split('/').map(Number);

        // Construct the start and end date for the month
        const startDate = new Date(year, month - 1, 1); // Months are 0-based in JavaScript
        const endDate = new Date(year, month, 0); // Get the last day of the month

        // MongoDB aggregation pipeline to fetch monthly data
        const monthlyData = await PaidRecord.aggregate([
            {
                $match: {
                    user_id: userId,
                    date: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$date" },
                        year: { $year: "$date" }
                    },
                    payments: {
                        $push: {
                            date: "$date",
                            amount: "$amount"
                        }
                    }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        return res.json({status: 1 , data : monthlyData});
    } catch (error) {
        console.log("error --- ", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


  

  // Update Paid Payment records 

  const updateRecord = async (req, res) => {
    try {
      const userId = req.query.userId;
      const paymentId = req.query.paymentId;
      const amount = req.query.amount;
  
      const existRecord = await PaidRecord.findOne({ paymentId});
  
      if (existRecord) {
        return res.json({
          status: 0,
          message: "Already Paid"
        });
      }

      await Payment.updateOne({ _id: paymentId }, { $set: { status: "Paid"  , updatedAt: new Date() } });

      await PaidRecord.create({
        user_id: userId,
        paymentId: paymentId,
        amount: amount,
      });
  
      return res.json({
        status: 1,
        message: "Record Saved Successfully"
      });
    } catch (error) {
      return res.status(500).json({
        status: 0,
        message: error.message,
      });
    }
  };

  const sumAmount = async (req, res) => {
    try {
      // Aggregate pipeline to sum the amounts
      const result = await PaidRecord.aggregate([
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } } // Group and sum the amounts
      ]);
  
      // Extract the total amount from the result
      const totalAmount = result.length > 0 ? result[0].totalAmount : 0;
  
      return res.json({
        status: 1,
        totalAmount: totalAmount
      });
    } catch (error) {
      return res.status(500).json({
        status: 0,
        message: error.message
      });
    }
  };
  


module.exports = {
    createRecord, 
    getPayments,
    updateRecord,
    getPaymentRecords,
    getPaymentAccordingToMonth,
    sumAmount
}