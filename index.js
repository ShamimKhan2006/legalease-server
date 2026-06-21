const express = require('express');
const cors=require("cors")
require('dotenv').config()
const app = express()
const port = 8000 

app.use(cors())
app.use(express.json())

 
// const { ObjectId } = require("mongodb");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri =process.env.MONGODB_URL
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
      const database = client.db("legalease");
    const lawyersColl= database.collection("laywersData");
    const topLawyers=database.collection("topLawyers")
    
     app.get('/', (req, res) => {
  res.send('Hello World!')
})

      app.get("/lawyers",async (req,res)=>{
        const query=req.query
        const result=await lawyersColl.find(query).toArray()
        res.send(result)

      })

      app.get("/lawyers/featured",async (req,res)=>{
        const query=req.query
        const result=await lawyersColl.find(query).limit(6).toArray()
        res.send(result)
      })


   app.get("/lawyers/top",async (req,res)=>{
    const query=req.query
    const result=await topLawyers.find(query).sort({hires:-1}).limit(3).toArray()
    res.send(result)
   })

   app.get("/lawyers",async(req,res)=>{
    const category=req.query.category
    const query={}

    if(category){
     query.specialization = { $regex: category, $options: "i" };
    }

    const result=await lawyersColl.find(query).toArray()
    res.send(result)
   })

   app.get("/lawyers/:id",async (req,res)=>{
    const {id}=req.params
    const lawyer=await lawyersColl.findOne({
      _id:new ObjectId(id)
    })

     res.send(lawyer)

   })

 



      app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);