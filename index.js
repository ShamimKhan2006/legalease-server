// const express = require('express');
// const cors=require("cors")
// require('dotenv').config()
// const app = express()
// const port = 8000 

// app.use(cors())
// app.use(express.json())

 
// // const { ObjectId } = require("mongodb");
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const uri =process.env.MONGODB_URL
// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });
// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//       const database = client.db("legalease");
//     const lawyersColl= database.collection("laywersData");
//     const topLawyers=database.collection("topLawyers")
    
//      app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

//       app.get("/lawyers",async (req,res)=>{
//         const query=req.query
//         const result=await lawyersColl.find(query).toArray()
//         res.send(result)

//       })

//       app.get("/lawyers/featured",async (req,res)=>{
//         const query=req.query
//         const result=await lawyersColl.find(query).limit(6).toArray()
//         res.send(result)
//       })


//    app.get("/lawyers/top",async (req,res)=>{
//     const query=req.query
//     const result=await topLawyers.find(query).sort({hires:-1}).limit(3).toArray()
//     res.send(result)
//    })

//    app.get("/lawyers",async(req,res)=>{
//     const category=req.query.category
//     const query={}

//     if(category){
//      query.specialization = { $regex: category, $options: "i" };
//     }

//     const result=await lawyersColl.find(query).toArray()
//     res.send(result)
//    })

//    app.get("/lawyers/:id",async (req,res)=>{
//     const {id}=req.params
//     const lawyer=await lawyersColl.findOne({
//       _id:new ObjectId(id)
//     })

//      res.send(lawyer)

//    })

 



//       app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });


//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }
// run().catch(console.dir);


const express = require('express');
const cors = require("cors");
require('dotenv').config();
const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URL;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const database = client.db("legalease");

    // আপনার আগের কালেকশন সমূহ
    const lawyersColl = database.collection("laywersData");
    const topLawyers = database.collection("topLawyers");

    // নতুন ড্যাশবোর্ডের জন্য প্রয়োজনীয় কালেকশন সমূহ
    const usersColl = database.collection("users");
    const hiringsColl = database.collection("hirings");
    const commentsColl = database.collection("comments");
    const transactionsColl = database.collection("transactions");

    app.get('/', (req, res) => {
      res.send('LegalEase Server is Running!');
    });

    // ==========================================
    // ১. LAWYER PUBLIC API (আপনার আগের এপিআইগুলো সামান্য ফিক্সড করা)
    // ==========================================
    
    // ক্যাটাগরি ফিল্টারিং সহ সব লয়ার পাওয়ার এপিআই (দুটি এপিআইকে একসাথে মার্জ করা হয়েছে)
    app.get("/lawyers", async (req, res) => {
      const category = req.query.category;
      let query = {};
      if (category) {
        query.specialization = { $regex: category, $options: "i" };
      }
      const result = await lawyersColl.find(query).toArray();
      res.send(result);
    });

    app.get("/lawyers/featured", async (req, res) => {
      const result = await lawyersColl.find({}).limit(6).toArray();
      res.send(result);
    });

    app.get("/lawyers/top", async (req, res) => {
      const result = await topLawyers.find({}).sort({ hires: -1 }).limit(3).toArray();
      res.send(result);
    });

    app.get("/lawyers/:id", async (req, res) => {
      const { id } = req.params;
      const lawyer = await lawyersColl.findOne({ _id: new ObjectId(id) });
      res.send(lawyer);
    });
//     app.post("/reviews", async (req, res) => {
//       const review = req.body;
//       const lawyer = await commentsColl.insertOne(review);
//       res.send(lawyer);
//     });

//     app.get("/reviews/:lawyerId", async (req, res) => {
//     const reviews = await commentsColl.find({ lawyerId: req.params.lawyerId }).toArray();
//     res.send(reviews);
// });
// নতুন রিভিউ সেভ করার জন্য
app.post("/reviews", async (req, res) => {
    const review = req.body;
    const result = await commentsColl.insertOne(review);
    res.send(result);
});

// রিভিউগুলো দেখার জন্য
app.get("/reviews/:lawyerId", async (req, res) => {
    const lawyerId = req.params.lawyerId;
    const reviews = await commentsColl.find({ lawyerId }).toArray();
    res.send(reviews);
});
     
//     app.get("/lawyers/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     // ✅ validate ObjectId first
//     if (!ObjectId.isValid(id)) {
//       return res.status(400).send({ message: "Invalid lawyer ID" });
//     }

//     const lawyer = await lawyersColl.findOne({
//       _id: new ObjectId(id),
//     });

//     if (!lawyer) {
//       return res.status(404).send({ message: "Lawyer not found" });
//     }

//     res.send(lawyer);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ message: "Server error" });
//   }
// });




    // ==========================================
    // ২. GENERAL & PROFILE MANAGEMENT (User & Lawyer)
    // ==========================================
    
    // ইউজারের প্রোফাইল ডাটা গেট করা (Next.js থেকে ইমেইল বা আইডি পাঠাবেন)
    app.get("/users/profile", async (req, res) => {
      const email = req.query.email;
      const user = await usersColl.findOne({ email: email });
      res.send(user);
    });

    // প্রোফাইল আপডেট (Full Name, Profile Picture, এবং Lawyer-দের এক্সট্রা ইনফো)
    // app.put("/users/update-profile", async (req, res) => {
    //   const { email, name, image, bio, fee, specialization, role } = req.body;
      
    //   let updateDoc = {
    //     $set: { name, image }
    //   };

    //   // ইউজার যদি লয়ার হয়, তাহলে তার লিগ্যাল প্রোফাইলের ডাটাও আপডেট হবে
    //   if (role === 'lawyer') {
    //     updateDoc.$set.bio = bio;
    //     updateDoc.$set.fee = parseFloat(fee);
    //     updateDoc.$set.specialization = specialization;
    //   }

    //   const result = await usersColl.updateOne({ email: email }, updateDoc, { upsert: true });
    //   res.send(result);
    // });
      // সার্ভারে সংশোধন করুন
app.put("/users/update-profile", async (req, res) =>
 {
  const { email, name, image, bio, fee, specialization, role } = req.body;
   console.log("Received data:", req.body)
  let updateFields = { name, image };

  if (role === 'lawyer') {
    updateFields = { ...updateFields, bio, fee: parseFloat(fee), specialization };
  }

  const result = await usersColl.updateOne(
    { email: email }, 
    { $set: updateFields }, 
    { upsert: true }
  );

  const updatedUser = await usersColl.findOne({ email: email });
  // ব্যাকএন্ডে এভাবে পাঠান
res.send({ success: true, result, user: updatedUser });
});
// সার্ভিস যোগ করা
app.post("/services", async (req, res) => {
  const service = req.body;
  const result = await database.collection("services").insertOne(service);
  res.send(result);
});

// নির্দিষ্ট লয়ারের সার্ভিস দেখা
app.get("/services", async (req, res) => {
  const email = req.query.email;
  const result = await database.collection("services").find({ lawyerEmail: email }).toArray();
  res.send(result);
});

// সার্ভিস ডিলিট করা
app.delete("/services/:id", async (req, res) => {
  const id = req.params.id;
  const result = await database.collection("services").deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});
    // ==========================================
    // ৩. USER DASHBOARD API
    // ==========================================
    
    // ইউজার লয়ারকে হায়ার করার রিকোয়েস্ট পাঠালে (ডিফল্ট স্ট্যাটাস "pending")
    app.post("/hiring-request", async (req, res) => {
      const hiringData = {
        ...req.body,
        status: "pending", // ডিফল্ট স্ট্যাটাস
        paymentStatus: "unpaid",
        hiringDate: new Date()
      };
      const result = await hiringsColl.insertOne(hiringData);
      res.send(result);
    });

    // ইউজারের নিজের Hiring History দেখার এপিআই
    app.get("/user/hiring-history", async (req, res) => {
      const email = req.query.email;
      const result = await hiringsColl.find({ clientEmail: email }).toArray();
      res.send(result);
    });

    // কমেন্ট বা রিভিউ ম্যানেজমেন্ট (User Profile এ দেখানোর জন্য)
    app.get("/user/comments", async (req, res) => {
      const email = req.query.email;
      const result = await commentsColl.find({ userEmail: email }).toArray();
      res.send(result);
    });

    app.put("/user/comments/:id", async (req, res) => {
      const { id } = req.params;
      const { commentText } = req.body;
      const result = await commentsColl.updateOne(
        { _id: new ObjectId(id) },
        { $set: { commentText, updatedAt: new Date() } }
      );
      res.send(result);
    });

    app.delete("/user/comments/:id", async (req, res) => {
      const { id } = req.params;
      const result = await commentsColl.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // ==========================================
    // ৪. LAWYER DASHBOARD API
    // ==========================================
    
    // লয়ারের কাছে আসা সব Hiring Requests দেখার এপিআই
    app.get("/lawyer/hiring-requests", async (req, res) => {
      const email = req.query.email;
      const result = await hiringsColl.find({ lawyerEmail: email }).toArray();
      res.send(result);
    });

    // লয়ার রিকোয়েস্ট Accept বা Reject করলে স্ট্যাটাস আপডেট
    app.patch("/lawyer/hiring-status/:id", async (req, res) => {
      const { id } = req.params;
      const { status } = req.body; // 'accepted' অথবা 'rejected' আসবে
      const result = await hiringsColl.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: status } }
      );
      res.send(result);
    });
      

    // ==========================================
    // ৫. ADMIN DASHBOARD API
    // ==========================================
    
    // সব ইউজারের লিস্ট দেখা
    app.get("/admin/users", async (req, res) => {
      const result = await usersColl.find({}).toArray();
      res.send(result);
    });

    // রোল চেঞ্জ করা এবং ইউজার ডিলিট করা
    app.patch("/admin/change-role/:id", async (req, res) => {
      const { id } = req.params;
      const { role } = req.body;
      const result = await usersColl.updateOne(
        { _id: new ObjectId(id) },
        { $set: { role: role } }
      );
      res.send(result);
    });

    app.delete("/admin/users/:id", async (req, res) => {
      const { id } = req.params;
      const result = await usersColl.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // সব ট্রানজেকশন দেখা
    app.get("/admin/all-transactions", async (req, res) => {
      const result = await transactionsColl.find({}).toArray();
      res.send(result);
    });

    // এডমিন অ্যানালিটিক্স ওভারভিউ
    app.get("/admin/analytics", async (req, res) => {
      const totalUsers = await usersColl.countDocuments({ role: "user" });
      const totalLawyers = await usersColl.countDocuments({ role: "lawyer" });
      const totalHires = await hiringsColl.countDocuments({});
      
      // মোট রেভিনিউ হিসেব করার জন্য aggregation
      const revenueResult = await transactionsColl.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]).toArray();
      
      const totalRevenue = revenueResult[0]?.total || 0;

      res.send({ totalUsers, totalLawyers, totalHires, totalRevenue });
    });

    // ==========================================
    // STRIPE & TRANSACTION SIMULATION
    // ==========================================
    app.post("/payments/success", async (req, res) => {
      const { transactionId, userEmail, lawyerEmail, amount, hiringId } = req.body;
      
      // ১. ট্রানজেকশন কালেকশনে ডেটা সেভ
      await transactionsColl.insertOne({
        transactionId, userEmail, lawyerEmail, amount, date: new Date()
      });

      // ২. hiring কালেকশনের paymentStatus 'paid' করে দেওয়া
      await hiringsColl.updateOne(
        { _id: new ObjectId(hiringId) },
        { $set: { paymentStatus: "paid" } }
      );

      res.send({ success: true, message: "Payment processed successfully" });
    });

        app.post("/transactions", async (req, res) => {
  const transaction = req.body;

  const result =
    await transactionsColl.insertOne(
      transaction
    );

  res.send(result);
});
    // সার্ভার লিসেনিং এবং পিং টেস্ট
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // client.close() বন্ধ রাখা হলো কারণ সার্ভার রানিং থাকবে
  }
}
run().catch(console.dir);