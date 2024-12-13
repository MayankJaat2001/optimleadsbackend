const Leads = require("./leadsModel");
const User = require("../user/user_model");
const bcrypt = require("bcryptjs");
const sentLead = require("./trackLeadModel");
const Broker = require("../brokers/brokersModel");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const nodemailer = require('nodemailer');


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

const convertToCsv = async (leads) => {
  try {
    const csvWriter = createCsvWriter({
      path: 'leads.csv',
      header: [
        { id: '_id', title: 'ID' },
        { id: 'user_id', title: 'Sender\'s ID' },
        { id: 'ownerName', title: 'Owner Name' },
        { id: 'ownerPhone', title: 'Owner Phone' },
        { id: 'monthlyRevenue', title: 'Monthly Revenue' },
        { id: 'industry', title: 'Industry' },
        { id: 'location', title: 'Location' },
        { id: 'SINno', title: 'SIN No' },
        { id: 'EINno', title: 'EIN No' },
        { id: 'ownerEmail', title: 'Owner Email' },
        { id: 'createdAt', title: 'Created At' },
        { id: '__v', title: 'V' }
      ]
    });

    // Write records to CSV
    await csvWriter.writeRecords(leads);

    // Return the path to the CSV file
    console.log("Done --- ")
    return 'leads.csv';
  } catch (error) {
    console.error('Error writing CSV:', error);
    throw error;
  }
};

// create Leads

const create = async (req, res) => {
  try {
    const { user_id, ownerName, ownerEmail, ownerPhone, monthlyRevenue, industry, location, SINno, EINno } = req.body;

    // Check if all required fields are present
    if (!ownerName || !ownerEmail || !ownerPhone || !monthlyRevenue || !industry || !location || !SINno || !EINno || !user_id) {
      return res.json({
        status: 0,
        message: "All fields are mandatory!"
      });
    }

    console.log("Working 1")

    // Validating User ID
    const user = await User.findById(user_id);
    if (!user) {
      return res.json({
        status: 0,
        message: "Invalid User ID",
      });
    }

    console.log("Working 2")

    // Check for existing leads with the same ownerPhone and user_id
    const existingLeadByPhone = await Leads.findOne({ user_id: user_id, ownerPhone: ownerPhone });
    if (existingLeadByPhone) {
      return res.json({
        status: 0,
        message: "Lead with this mobile is already added!",
      });
    }

    console.log("Working 3")

    // Check for existing leads with the same ownerEmail and user_id
    const existingLeadByEmail = await Leads.findOne({ user_id: user_id, ownerEmail: ownerEmail });
    if (existingLeadByEmail) {
      return res.json({
        status: 0,
        message: "Lead with this email already added!"
      });
    }

    console.log("Working 4" , " - " , user_id ,  " - " , ownerEmail ,  " - " , industry)
    // Create the lead
    const lead = await Leads.create({
      user_id: user_id,
      ownerName: ownerName,
      ownerEmail: ownerEmail,
      ownerPhone: ownerPhone,
      monthlyRevenue: monthlyRevenue,
      industry: industry,
      location: location,
      SINno: SINno,
      EINno: EINno,
    });
    console.log("Working 5")
    return res.json({
      status: 1,
      message: "Lead Created",
    });

  } catch (error) {
    // Check for duplicate key error and return appropriate response
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.user_id && error.keyPattern.ownerPhone) {
        return res.status(400).json({
          status: 0,
          message: "Lead with this mobile already exists!"
        });
      } else if (error.keyPattern && error.keyPattern.user_id && error.keyPattern.ownerEmail) {
        return res.status(400).json({
          status: 0,
          message: "Lead with this email already exists!"
        });
      }
    }

    // Handle other errors
    return res.status(500).json({
      status: 0,
      message: error.message
    });
  }
}

const createLeadCSV = async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const leadsArray = req.body.leads; // Assuming leads is an array of leads in the request body

    // Check if leadsArray is provided and it's an array
    if (!Array.isArray(leadsArray) || leadsArray.length === 0) {
      return res.status(400).json({
        status: 0,
        message: "No leads provided or leads is not an array!"
      });
    }

    const createdLeads = [];
    const skippedLeads = [];

    for (const leadData of leadsArray) {
      const { ownerName, ownerEmail, ownerPhone, monthlyRevenue, industry, location, SINno, EINno } = leadData;

      // Check if all required fields are present
      if (!ownerName || !ownerEmail || !ownerPhone || !monthlyRevenue || !industry || !location || !SINno || !EINno) {
        return res.status(400).json({
          status: 0,
          message: "All fields are mandatory for each lead!"
        });
      }

      // Check for existing leads with the same ownerPhone and user_id
      const existingLeadByPhone = await Leads.findOne({ user_id: user_id, ownerPhone: ownerPhone });
      const existingLeadByEmail = await Leads.findOne({ user_id: user_id, ownerEmail: ownerEmail });

      if (existingLeadByPhone || existingLeadByEmail) {
        skippedLeads.push({
          ownerName: ownerName,
          ownerEmail: ownerEmail,
          ownerPhone: ownerPhone,
          message: "Lead already exists"
        });
        continue; // Skip creation of this lead and continue with the next one
      }

      // Create the lead
      const lead = await Leads.create({
        user_id: user_id,
        ownerName: ownerName,
        ownerEmail: ownerEmail,
        ownerPhone: ownerPhone,
        monthlyRevenue: monthlyRevenue,
        industry: industry,
        location: location,
        SINno: SINno,
        EINno: EINno,
      });
      createdLeads.push(lead);
    }

    return res.json({
      status: 1,
      message: "Leads Created",
      leads: createdLeads,
      skippedLeads: skippedLeads
    });

  } catch (error) {
    // Handle errors
    return res.status(500).json({
      status: 0,
      message: error.message
    });
  }
}



const getLeads = async (req, res) => {
  try {
    const user_id = req.query.user_id;
    console.log("User -- " , user_id);
    const getLeadsInfo = await Leads.find( { user_id: user_id });
    console.log("Get Leads Info -- -- " , getLeadsInfo);
    if(!getLeadsInfo){
      res.status(200).json({
        status: 0,
        message : 'Leads not found!'
      })
    }
    res.status(200).json({
      status: 1,
      data: getLeadsInfo,
    });
  } catch (error) {
    return res.status(500).json({
      status: 0,
      message: error.message,
    });
  }
};

// Delete Leads 

const deleteLead = async (req, res) => {
  try {
    const deleteRequests = req.body;

    // Check if deleteRequests array is provided
    if (!Array.isArray(deleteRequests) || deleteRequests.length === 0) {
      return res.json({
        status: 0,
        message: "No delete requests provided."
      });
    }

    // Define arrays to store lead emails and user IDs
    const leadEmails = [];
    const userIds = [];

    // Extract lead emails and user IDs from deleteRequests
    deleteRequests.forEach(request => {
      if (request.leadEmails && request.userIds) {
        leadEmails.push(request.leadEmails);
        userIds.push(request.userIds);
      }
    });

    // Delete leads based on provided lead emails and user IDs
    const deletionResult = await Leads.deleteMany({ ownerEmail: { $in: leadEmails }, user_id: { $in: userIds } });

    // Check if any lead was deleted
    if (deletionResult.deletedCount === 0) {
      return res.json({
        status: 0,
        message: "No leads found with provided lead emails and user IDs."
      });
    }

    // Respond with success message
    return res.json({
      status: 1,
      message: `${deletionResult.deletedCount} lead(s) deleted successfully.`
    });
  } catch (error) {
    // Handle errors
    return res.status(500).json({
      status: 0,
      message: error.message
    });
  }
};

// sendLeads

const sendLeads = async (req, res) => {
  try {
    const brokerEmail = req.query.email;

    const findPhone = await User.findOne({phone: phone })
    const findBrokerEmail = await Broker.findOne({brokerEmail: brokerEmail });

    if(!findBrokerEmail){
      return res.json({
        status: 0,
        message: "Broker Email ID does not exists!"
      })
    }


    var mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: "Leads from OptimalLeads",
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


async function addDataToDatabase(data) {
  console.log("Data -------------->>>>     " , data)
  try {
    const addedEntries = [];
    const skippedEntries = [];

    // Iterate through each entry in the data array
    for (const entry of data) {
      // Check if an entry with the same userId, leadEmail, and brokerEmail exists in the database
      const existingEntry = await sentLead.findOne({
        userId: entry.userId,
        leadEmail: entry.leadEmail,
        brokerEmail: entry.brokerEmail
      });

      // If an entry with the same combination exists, skip adding it to the skippedEntries array
      if (existingEntry) {
        skippedEntries.push(entry);
        console.log(`Entry with userId ${entry.userId}, leadEmail ${entry.leadEmail}, and brokerEmail ${entry.brokerEmail} already exists. Skipping.`);
        continue;
      }

      // If no such entry exists, add it to the addedEntries array
      addedEntries.push(entry);
    }

    // Insert only the added entries into the database
    if (addedEntries.length > 0) {
      await sentLead.insertMany(addedEntries);
      console.log('Added entries inserted into the database successfully.');
    }

    console.log('Data added to database successfully.');

    return { addedEntries, skippedEntries };
  } catch (error) {
    console.error('Error adding data to database:', error);
    throw error; // Rethrow the error to handle it in the calling code if needed
  }
}

// send Lead in Broker's Email

const sendEmailLead = async (req, res) => {
  const user_id = req.query.user_id;
  const { leadArray, brokerEmail, note } = req.body;

  // Convert lead details to CSV
  try{
    const emailArray = leadArray.map(lead => ({
      userId: user_id, // Using user_id from query params
      leadEmail: lead.ownerEmail, // Assuming lead email is stored in ownerEmail field
      brokerEmail: brokerEmail
    }));
    console.log( "Entered---- ",)
    const { addedEntries, skippedEntries } = await addDataToDatabase(emailArray);

    if (skippedEntries.length > 0) {
      const skippedLeadEmails = skippedEntries.map(entry => entry.leadEmail);
      return res.status(200).send({
        status: 0,
        message: `Cannot send ${skippedLeadEmails} to the broker.`
      })
    }
   
  const csvFilePath  = await convertToCsv(leadArray);
  console.log( "CSV file path ---- ", csvFilePath)

  // Send email
  var mailOptions = {
    from: process.env.SMTP_MAIL,
    to: brokerEmail,
    subject: "Leads from OptimLeads",
    text: `Please find the attached CSV file containing lead details. ${note}`,
    attachments: [
      {
          filename: 'leads.csv',
          path: csvFilePath
      }
  ]
  };
  console.log( "mailOption Correct---- ",)

  await new Promise((resolve, reject) => transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log('send main Error ', error);
      reject(error); // Reject the promise if there's an error
      return res.status(200).send({
        status: 0,
        message: error
      })
     
    } else {
      console.log("Email Sent Successfully!");
      resolve(); // Resolve the promise if email is sent successfully
    }
  }));
      
      return res.status(200).send({
        status: 1,
        message: 'Email sent successfully',
      });
  } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).send({satus: 0 , message : 'Failed to send email'});
  }
}



// trackSentLead

function extractDataFromBody(req) {
  return req.body.map(({ userId, leadEmail, brokerEmail }) => ({
    userId, // Assuming userId corresponds to leadId
    leadEmail,
    brokerEmail
  }));
}

const trackSentLead = async (data) => {
 
  try {
    
    // Add data to the database and get added and skipped entries
    const { addedEntries, skippedEntries } = await addDataToDatabase(data);

    const response = { 
      message: 'Data added to database successfully.',
      addedEntries
    };

    if (skippedEntries.length > 0) {
      const skippedLeadEmails = skippedEntries.map(entry => entry.leadEmail);
      response.skippedLeadEmails = skippedLeadEmails;
      response.skippedEntriesCount = skippedEntries.length;
    }

    return json(response);
  }catch (error) {
    return error.message
  }
}


module.exports = {
    create,
    getLeads,
    trackSentLead,
    deleteLead,
    sendLeads,
    sendEmailLead,
    createLeadCSV
}