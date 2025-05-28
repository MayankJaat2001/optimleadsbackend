const express = require("express");
const  mongoose = require('mongoose');
const dotenv = require("dotenv");
const serverless = require("serverless-http");
const commonPath = `/.netlify/functions/server`;
const bodyParser = require('body-parser');
const cors = require('cors');



dotenv.config({path: "./.env"});
const app = express();

const port = process.env.PORT || 5000;
app.use(cors({
  origin: "*", // Or use your specific domain if needed
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
// app.options('*', cors());
// app.use(cors({
//   origin: ["/"],
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   credentials: true
// }));
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// mongoose.connect('mongodb+srv://Manish49724:admin@123@optimleads.udq0ecb.mongodb.net/')
const connectToMongoDB = require("./config/mongoose")

const UserSchema = mongoose.Schema({
    name: String,
    age:Number
})

const UserModal = mongoose.model("users" , UserSchema)

app.get('/' , (req , res) => {
    res.send('App is running');
  });

app.use(`${commonPath}/users` , require("./user/user_router"));
app.use(`${commonPath}/leads` , require("./leads/leadsRouter"))
app.use(`${commonPath}/brokers`, require("./brokers/brokersRouter"))
app.use(`${commonPath}/payments`, require("./payments/paymentRouter"))

app.get("/getUsers" , (req , res ) => {
    UserModal.find({name: "Manish"}).then(function(users){
        res.json(users)
        console.log("Found Items -- " , users)
    }).catch(function(err){
        console.log("error " , err)
    })
});

app.use((req, res) => {
    res.status(404).send("API not found, please check your path");
  });


app.listen(port, () => {
    console.log(`Listening to port ${port}`);
    connectToMongoDB();
  });

exports.handler = serverless(app);
