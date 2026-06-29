// // const express = require('express');
// // const cors=require("cors")
// // require('dotenv').config()
// // const app = express()
// // const port = 8000 

// // app.use(cors())
// // app.use(express.json())

 
// // // const { ObjectId } = require("mongodb");
// // const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// // const uri =process.env.MONGODB_URL
// // // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// // const client = new MongoClient(uri, {
// //   serverApi: {
// //     version: ServerApiVersion.v1,
// //     strict: true,
// //     deprecationErrors: true,
// //   }
// // });
// // async function run() {
// //   try {
// //     // Connect the client to the server	(optional starting in v4.7)
// //     await client.connect();
// //     // Send a ping to confirm a successful connection
// //       const database = client.db("legalease");
// //     const lawyersColl= database.collection("laywersData");
// //     const topLawyers=database.collection("topLawyers")
    
// //      app.get('/', (req, res) => {
// //   res.send('Hello World!')
// // })

// //       app.get("/lawyers",async (req,res)=>{
// //         const query=req.query
// //         const result=await lawyersColl.find(query).toArray()
// //         res.send(result)

// //       })

// //       app.get("/lawyers/featured",async (req,res)=>{
// //         const query=req.query
// //         const result=await lawyersColl.find(query).limit(6).toArray()
// //         res.send(result)
// //       })


// //    app.get("/lawyers/top",async (req,res)=>{
// //     const query=req.query
// //     const result=await topLawyers.find(query).sort({hires:-1}).limit(3).toArray()
// //     res.send(result)
// //    })

// //    app.get("/lawyers",async(req,res)=>{
// //     const category=req.query.category
// //     const query={}

// //     if(category){
// //      query.specialization = { $regex: category, $options: "i" };
// //     }

// //     const result=await lawyersColl.find(query).toArray()
// //     res.send(result)
// //    })

// //    app.get("/lawyers/:id",async (req,res)=>{
// //     const {id}=req.params
// //     const lawyer=await lawyersColl.findOne({
// //       _id:new ObjectId(id)
// //     })

// //      res.send(lawyer)

// //    })

 



// //       app.listen(port, () => {
// //   console.log(`Server running on port ${port}`);
// // });


// //     await client.db("admin").command({ ping: 1 });
// //     console.log("Pinged your deployment. You successfully connected to MongoDB!");
// //   } finally {
// //     // Ensures that the client will close when you finish/error
// //     // await client.close();
// //   }
// // }
// // run().catch(console.dir);


// const express = require('express');
// const cors = require("cors");
// require('dotenv').config();
// const app = express();
// const port = 8000;

// app.use(cors({origin:"*"}));
// app.use(express.json());

// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const uri = process.env.MONGODB_URL;
// const { createRemoteJWKSet, jwtVerify } = require("jose-node-cjs-runtime");
// const JWKS = createRemoteJWKSet(new URL(`${process.env.JWKS_URL}/api/auth/jwks`));

// // ================= AUTH MIDDLEWARE =================
// const verifyToken = async (req, res, next) => {
//   try {
//     const authHeaders = req?.headers.authorization;

//     if (!authHeaders) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const token = authHeaders.split(" ")[1];
//     console.log("token",token)

//     if (!token) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const { payload } = await jwtVerify(token, JWKS);

//     req.payload = payload;
//     next();
//   } catch (error) {
//     return res.status(403).json({ message: "Forbidden" });
//   }
// };

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
//     // await client.connect();
//     const database = client.db("legalease");

//     // আপনার আগের কালেকশন সমূহ
//     const lawyersColl = database.collection("laywersData");
//     const topLawyers = database.collection("topLawyers");

//     // নতুন ড্যাশবোর্ডের জন্য প্রয়োজনীয় কালেকশন সমূহ
//     const usersColl = database.collection("user");
//     const hiringsColl = database.collection("hirings");
//     const commentsColl = database.collection("comments");
//     const transactionsColl = database.collection("transactions");

//     app.get('/', (req, res) => {
//       res.send('LegalEase Server is Running!!!');
//     });

//     // ==========================================
//     // ১. LAWYER PUBLIC API (আপনার আগের এপিআইগুলো সামান্য ফিক্সড করা)
//     // ==========================================
    
//     // ক্যাটাগরি ফিল্টারিং সহ সব লয়ার পাওয়ার এপিআই (দুটি এপিআইকে একসাথে মার্জ করা হয়েছে)
//     app.get("/lawyers", async (req, res) => {
//       const category = req.query.category;
//       let query = {};
//       if (category) {
//         query.specialization = { $regex: category, $options: "i" };
//       }
//       const result = await lawyersColl.find(query).toArray();
//       res.send(result);
//     });

//     app.get("/lawyers/featured", async (req, res) => {
//       const result = await lawyersColl.find({}).limit(6).toArray();
//       res.send(result);
//     });

//     app.get("/lawyers/top", async (req, res) => {
//       const result = await topLawyers.find({}).sort({ hires: -1 }).limit(3).toArray();
//       res.send(result);
//     });

//     app.get("/lawyers/:id", async (req, res) => {
//       const { id } = req.params;
//       const lawyer = await lawyersColl.findOne({ _id: new ObjectId(id) });
//       res.send(lawyer);
//     });
// //     app.post("/reviews", async (req, res) => {
// //       const review = req.body;
// //       const lawyer = await commentsColl.insertOne(review);
// //       res.send(lawyer);
// //     });

// //     app.get("/reviews/:lawyerId", async (req, res) => {
// //     const reviews = await commentsColl.find({ lawyerId: req.params.lawyerId }).toArray();
// //     res.send(reviews);
// // });
// // নতুন রিভিউ সেভ করার জন্য
// app.post("/reviews", async (req, res) => {
//     const review = req.body;
//     const result = await commentsColl.insertOne(review);
//     res.send(result);
// });

//   app.get("/reviews/:lawyerId", async (req, res) => {
//   const lawyerId = req.params.lawyerId;
//   const reviews = await commentsColl.find({ lawyerId }).toArray();
//   res.send(reviews);
// });


// // রিভিউগুলো দেখার জন্য
// // app.get("/reviews/:lawyerId", async (req, res) => {
// //     const lawyerId = req.params.lawyerId;
// //     const reviews = await commentsColl.find({ lawyerId })
// //     res.send(reviews);
// // });
     
// //     app.get("/lawyers/:id", async (req, res) => {
// //   try {
// //     const { id } = req.params;

// //     // ✅ validate ObjectId first
// //     if (!ObjectId.isValid(id)) {
// //       return res.status(400).send({ message: "Invalid lawyer ID" });
// //     }

// //     const lawyer = await lawyersColl.findOne({
// //       _id: new ObjectId(id),
// //     });

// //     if (!lawyer) {
// //       return res.status(404).send({ message: "Lawyer not found" });
// //     }

// //     res.send(lawyer);
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).send({ message: "Server error" });
// //   }
// // });




//     // ==========================================
//     // ২. GENERAL & PROFILE MANAGEMENT (User & Lawyer)
//     // ==========================================
    
//     // ইউজারের প্রোফাইল ডাটা গেট করা (Next.js থেকে ইমেইল বা আইডি পাঠাবেন)
//     app.get("/users/profile", async (req, res) => {
//       const email = req.query.email;
//       const user = await usersColl.findOne({ email: email });
//       res.send(user);
//     });

//     // প্রোফাইল আপডেট (Full Name, Profile Picture, এবং Lawyer-দের এক্সট্রা ইনফো)
//     // app.put("/users/update-profile", async (req, res) => {
//     //   const { email, name, image, bio, fee, specialization, role } = req.body;
      
//     //   let updateDoc = {
//     //     $set: { name, image }
//     //   };

//     //   // ইউজার যদি লয়ার হয়, তাহলে তার লিগ্যাল প্রোফাইলের ডাটাও আপডেট হবে
//     //   if (role === 'lawyer') {
//     //     updateDoc.$set.bio = bio;
//     //     updateDoc.$set.fee = parseFloat(fee);
//     //     updateDoc.$set.specialization = specialization;
//     //   }

//     //   const result = await usersColl.updateOne({ email: email }, updateDoc, { upsert: true });
//     //   res.send(result);
//     // });
//       // সার্ভারে সংশোধন করুন
// app.put("/users/update-profile", async (req, res) =>
//  {
//   const { email, name, image, bio, fee, specialization, role } = req.body;
//    console.log("Received data:", req.body)
//   let updateFields = { name, image };

//   if (role === 'lawyer') {
//     updateFields = { ...updateFields, bio, fee: parseFloat(fee), specialization };
//   }

//   const result = await usersColl.updateOne(
//     { email: email }, 
//     { $set: updateFields }, 
//     { upsert: true }
//   );

//   const updatedUser = await usersColl.findOne({ email: email });
//   // ব্যাকএন্ডে এভাবে পাঠান
// res.send({ success: true, result, user: updatedUser });
// });
// // সার্ভিস যোগ করা
// app.post("/services", async (req, res) => {
//   const service = req.body;
//   const result = await database.collection("services").insertOne(service);
//   res.send(result);
// });

// // নির্দিষ্ট লয়ারের সার্ভিস দেখা
// app.get("/services", async (req, res) => {
//   const email = req.query.email;
//   const result = await database.collection("services").find({ lawyerEmail: email }).toArray();
//   res.send(result);
// });

// // সার্ভিস ডিলিট করা
// app.delete("/services/:id", async (req, res) => {
//   const id = req.params.id;
//   const result = await database.collection("services").deleteOne({ _id: new ObjectId(id) });
//   res.send(result);
// });
//     // ==========================================
//     // ৩. USER DASHBOARD API
//     // ==========================================
    
//     // ইউজার লয়ারকে হায়ার করার রিকোয়েস্ট পাঠালে (ডিফল্ট স্ট্যাটাস "pending")
//     app.post("/hiring-request", async (req, res) => {
//       const hiringData = {
//         ...req.body,
//         status: "pending", // ডিফল্ট স্ট্যাটাস
//         paymentStatus: "unpaid",
//         hiringDate: new Date()
//       };
//       const result = await hiringsColl.insertOne(hiringData);
//       res.send(result);
//     });

//     // ইউজারের নিজের Hiring History দেখার এপিআই
//     app.get("/user/hiring-history", async (req, res) => {
//       const email = req.query.email;
//       const result = await hiringsColl.find({ clientEmail: email }).toArray();
//       res.send(result);
//     });

//     // কমেন্ট বা রিভিউ ম্যানেজমেন্ট (User Profile এ দেখানোর জন্য)
//     app.get("/user/comments", async (req, res) => {
//       const email = req.query.email;
//       const result = await commentsColl.find({ userEmail: email }).toArray();
//       res.send(result);
//     });

//     app.put("/user/comments/:id", async (req, res) => {
//       const { id } = req.params;
//       const { commentText } = req.body;
//       const result = await commentsColl.updateOne(
//         { _id: new ObjectId(id) },
//         { $set: { commentText, updatedAt: new Date() } }
//       );
//       res.send(result);
//     });

//     app.delete("/user/comments/:id", async (req, res) => {
//       const { id } = req.params;
//       const result = await commentsColl.deleteOne({ _id: new ObjectId(id) });
//       res.send(result);
//     });

//     // ==========================================
//     // ৪. LAWYER DASHBOARD API
//     // ==========================================
    
//     // লয়ারের কাছে আসা সব Hiring Requests দেখার এপিআই
//     app.get("/lawyer/hiring-requests", async (req, res) => {
//       const email = req.query.email;
//       const result = await hiringsColl.find({ lawyerEmail: email }).toArray();
//       res.send(result);
//     });

//     // লয়ার রিকোয়েস্ট Accept বা Reject করলে স্ট্যাটাস আপডেট
//     app.patch("/lawyer/hiring-status/:id", async (req, res) => {
//       const { id } = req.params;
//       const { status } = req.body; // 'accepted' অথবা 'rejected' আসবে
//       const result = await hiringsColl.updateOne(
//         { _id: new ObjectId(id) },
//         { $set: { status: status } }
//       );
//       res.send(result);
//     });
      


//     // Express route
// app.post("/create-checkout-session", async (req, res) => {
//   const { amount, hireId, lawyerName, userEmail } = req.body;
//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ["card"],
//     line_items: [{ price_data: { currency: "bdt", product_data: { name: `Fee: ${lawyerName}` }, unit_amount: amount * 100 }, quantity: 1 }],
//     mode: "payment",
//     success_url: `${YOUR_FRONTEND_URL}/payment-success?hireId=${hireId}`,
//     cancel_url: `${YOUR_FRONTEND_URL}/hiring-history`,
//     customer_email: userEmail,
//   });
//   res.json({ sessionId: session.id });
// });
    



// app.post("/hirings", async (req, res) => {
//   const { lawyerId, clientName, clientEmail, userEmail, status, stripeSessionId } = req.body;
 
//   // lawyerId দিয়ে lawyer-এর email বের করো
//   const lawyer = await lawyersColl.findOne({ _id: new ObjectId(lawyerId) });
 
//   if (!lawyer) {
//     return res.status(404).json({ message: "Lawyer not found" });
//   }
 
//   const hiringDoc = {
//     lawyerId,
//     lawyerEmail: lawyer.email,   // ✅ lawyer dashboard filter করবে এই email দিয়ে
//     lawyerName: lawyer.name,
//     clientName: clientName || "Unknown",
//     clientEmail: clientEmail || userEmail || "unknown",
//     userEmail: clientEmail || userEmail || "unknown",
//     status: status || "pending",
//     stripeSessionId: stripeSessionId || null,
//     hiringDate: new Date(),
//     createdAt: new Date(),
//   };
 
//   const result = await hiringsColl.insertOne(hiringDoc);
//   res.json(result);
// });







// // ==========================================
//     // ৫. ADMIN DASHBOARD API
//     // ==========================================
    




//     // সব ইউজারের লিস্ট দেখা
//     // GET all users
// app.get("/admin/users", async (req, res) => {
//   const result = await usersColl.find({}).toArray();
//   res.send(result);
// });

// // PATCH - role change
// app.patch("/admin/change-role/:id", async (req, res) => {
//   const { id } = req.params;
//   const { role } = req.body;
//   const result = await usersColl.updateOne(
//     { _id: new ObjectId(id) },
//     { $set: { role } }
//   );
//   res.send(result);
// });

// // DELETE - user delete ✅
// app.delete("/admin/users/:id", async (req, res) => {
//   const { id } = req.params;
//   const result = await usersColl.deleteOne({ _id: new ObjectId(id) });
//   res.send(result);
// });

//     // সব ট্রানজেকশন দেখা
//     app.get("/admin/all-transactions", async (req, res) => {
//       const result = await transactionsColl.find({}).toArray();
//       res.send(result);
//     });

//     // এডমিন অ্যানালিটিক্স ওভারভিউ
//     app.get("/admin/analytics", async (req, res) => {
//       const totalUsers = await usersColl.countDocuments({ role: "user" });
//       const totalLawyers = await usersColl.countDocuments({ role: "lawyer" });
//       const totalHires = await hiringsColl.countDocuments({});
      
//       // মোট রেভিনিউ হিসেব করার জন্য aggregation
//       const revenueResult = await transactionsColl.aggregate([
//         { $group: { _id: null, total: { $sum: "$amount" } } }
//       ]).toArray();
      
//       const totalRevenue = revenueResult[0]?.total || 0;

//       res.send({ totalUsers, totalLawyers, totalHires, totalRevenue });
//     });



// // পেমেন্ট সাকসেস হ্যান্ডেলার
// app.post("/payments/success", async (req, res) => {
//   const { hiringId, status } = req.body;

//   try {
//     // hiring কালেকশনের paymentStatus এবং status আপডেট করা
//     const result = await hiringsColl.updateOne(
//       { _id: new ObjectId(hiringId) },
//       { 
//         $set: { 
//           paymentStatus: "paid",
//           status: "confirmed" // পেমেন্ট হলে অ্যাপয়েন্টমেন্ট কনফার্মড
//         } 
//       }
//     );

//     res.send({ success: true, result });
//   } catch (error) {
//     res.status(500).send({ message: "Failed to update status" });
//   }
// });

//     // সার্ভার লিসেনিং এবং পিং টেস্ট
//     app.listen(port, () => {
//       console.log(`Server running on port ${port}`);
//     });

//     // await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!!!");
//   } finally {
//     // client.close() বন্ধ রাখা হলো কারণ সার্ভার রানিং থাকবে
//   }
// }
// run().catch(console.dir);





























const express = require('express');
const cors = require("cors");
require('dotenv').config();
const app = express();
const port = 8000;

app.use(cors({ origin: "*" }));
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URL;
const { createRemoteJWKSet, jwtVerify } = require("jose-node-cjs-runtime");
const JWKS = createRemoteJWKSet(new URL(`${process.env.JWKS_URL}/api/auth/jwks`));

const verifyToken = async (req, res, next) => {
  try {
    const authHeaders = req?.headers.authorization;
    if (!authHeaders) return res.status(401).json({ message: "Unauthorized" });
    const token = authHeaders.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const { payload } = await jwtVerify(token, JWKS);
    req.payload = payload;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden" });
  }
};

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

async function run() {
  try {
    const database = client.db("legalease");
    const lawyersColl = database.collection("laywersData");
    const topLawyers = database.collection("topLawyers");
    const usersColl = database.collection("user");
    const hiringsColl = database.collection("hirings");
    const commentsColl = database.collection("comments");
    const transactionsColl = database.collection("transactions");

    app.get('/', (req, res) => res.send('LegalEase Server is Running!!!'));

    // ==========================================
    // ১. LAWYER PUBLIC API
    // ==========================================
    app.get("/lawyers", async (req, res) => {
      const category = req.query.category;
      let query = {};
      if (category) query.specialization = { $regex: category, $options: "i" };
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

    // ==========================================
    // ২. REVIEWS
    // ==========================================
    app.post("/reviews", async (req, res) => {
      const result = await commentsColl.insertOne(req.body);
      res.send(result);
    });

    app.get("/reviews/:lawyerId", async (req, res) => {
      const reviews = await commentsColl.find({ lawyerId: req.params.lawyerId }).toArray();
      res.send(reviews);
    });

    // ==========================================
    // ৩. USER & PROFILE
    // ==========================================
    app.get("/users/profile", async (req, res) => {
      const user = await usersColl.findOne({ email: req.query.email });
      res.send(user);
    });

    app.put("/users/update-profile", async (req, res) => {
      const { email, name, image, bio, fee, specialization, role } = req.body;
      let updateFields = { name, image };
      if (role === 'lawyer') {
        updateFields = { ...updateFields, bio, fee: parseFloat(fee), specialization };
      }
      const result = await usersColl.updateOne({ email }, { $set: updateFields }, { upsert: true });
      const updatedUser = await usersColl.findOne({ email });
      res.send({ success: true, result, user: updatedUser });
    });

    // ==========================================
    // ৪. SERVICES
    // ==========================================
    app.post("/services", async (req, res) => {
      const result = await database.collection("services").insertOne(req.body);
      res.send(result);
    });

    app.get("/services", async (req, res) => {
      const result = await database.collection("services").find({ lawyerEmail: req.query.email }).toArray();
      res.send(result);
    });

    app.delete("/services/:id", async (req, res) => {
      const result = await database.collection("services").deleteOne({ _id: new ObjectId(req.params.id) });
      res.send(result);
    });

    // ==========================================
    // ৫. HIRINGS — মূল fix এখানে
    // ==========================================

    // ✅ FIXED: lawyerId দিয়ে lawyer খুঁজে, users collection থেকে lawyerEmail বের করে
  app.post("/hirings", async (req, res) => {
  try {
    const { lawyerId, clientName, clientEmail, userEmail, status, stripeSessionId } = req.body;

    const lawyer = await lawyersColl.findOne({ _id: new ObjectId(lawyerId) });
    if (!lawyer) return res.status(404).json({ message: "Lawyer not found" });

    let lawyerEmail = lawyer.email || null;
    if (!lawyerEmail) {
      const lawyerUser = await usersColl.findOne({
        role: "lawyer",
        name: { $regex: new RegExp(`^${lawyer.name}$`, "i") }
      });
      lawyerEmail = lawyerUser?.email || null;
    }

    const finalClientEmail = clientEmail || userEmail || "unknown";

    const hiringDoc = {
      lawyerId,
      lawyerEmail,
      lawyerName: lawyer.name,
      lawyerFee: lawyer.hourlyRate || 0,        // ✅ এটা যোগ করো
      specialization: lawyer.specialization || "", // ✅ এটা যোগ করো
      clientName: clientName || "Unknown",
      clientEmail: finalClientEmail,
      userEmail: finalClientEmail,
      status: status || "pending",
      paymentStatus: "paid",
      stripeSessionId: stripeSessionId || null,
      hiringDate: new Date(),
      createdAt: new Date(),
    };

    const result = await hiringsColl.insertOne(hiringDoc);
    res.json(result);
  } catch (err) {
    console.error("hirings POST error:", err.message);
    res.status(500).json({ message: err.message });
  }
});
    // ==========================================
    // ৬. USER DASHBOARD
    // ==========================================
    app.post("/hiring-request", async (req, res) => {
      const hiringData = { ...req.body, status: "pending", 
hourlyRate:hourlyRate, paymentStatus: "unpaid", hiringDate: new Date() };
      const result = await hiringsColl.insertOne(hiringData);
      res.send(result);
    });

    // ✅ clientEmail দিয়ে filter (hirings-এ userEmail ও clientEmail দুটোই আছে)
    app.get("/user/hiring-history", async (req, res) => {
      const email = req.query.email;
      const result = await hiringsColl.find({
        $or: [{ clientEmail: email }, { userEmail: email }]
      }).toArray();
      res.send(result);
    });

    app.get("/user/comments", async (req, res) => {
      const result = await commentsColl.find({ userEmail: req.query.email }).toArray();
      res.send(result);
    });

    app.put("/user/comments/:id", async (req, res) => {
      const result = await commentsColl.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { commentText: req.body.commentText, updatedAt: new Date() } }
      );
      res.send(result);
    });

    app.delete("/user/comments/:id", async (req, res) => {
      const result = await commentsColl.deleteOne({ _id: new ObjectId(req.params.id) });
      res.send(result);
    });

    // ==========================================
    // ৭. LAWYER DASHBOARD
    // ==========================================
    app.get("/lawyer/hiring-requests", async (req, res) => {
      const email = req.query.email;
      const result = await hiringsColl.find({ lawyerEmail: email }).toArray();
      res.send(result);
    });

    app.patch("/lawyer/hiring-status/:id", async (req, res) => {
      const result = await hiringsColl.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { status: req.body.status } }
      );
      res.send(result);
    });

    // ==========================================
    // ৮. ADMIN DASHBOARD
    // ==========================================
    app.get("/admin/users", async (req, res) => {
      const result = await usersColl.find({}).toArray();
      res.send(result);
    });

    app.patch("/admin/change-role/:id", async (req, res) => {
      const result = await usersColl.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { role: req.body.role } }
      );
      res.send(result);
    });

    app.delete("/admin/users/:id", async (req, res) => {
      const result = await usersColl.deleteOne({ _id: new ObjectId(req.params.id) });
      res.send(result);
    });

    app.get("/admin/all-transactions", async (req, res) => {
      const result = await transactionsColl.find({}).toArray();
      res.send(result);
    });

    app.get("/admin/analytics", async (req, res) => {
      const totalUsers = await usersColl.countDocuments({ role: "user" });
      const totalLawyers = await usersColl.countDocuments({ role: "lawyer" });
      const totalHires = await hiringsColl.countDocuments({});
      const revenueResult = await transactionsColl.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]).toArray();
      res.send({ totalUsers, totalLawyers, totalHires, totalRevenue: revenueResult[0]?.total || 0 });
    });

    app.post("/payments/success", async (req, res) => {
      try {
        const result = await hiringsColl.updateOne(
          { _id: new ObjectId(req.body.hiringId) },
          { $set: { paymentStatus: "paid", status: "confirmed" } }
        );
        res.send({ success: true, result });
      } catch (error) {
        res.status(500).send({ message: "Failed to update status" });
      }
    });

    app.listen(port, () => console.log(`Server running on port ${port}`));
    console.log("Connected to MongoDB!!!");
  } finally {}
}
run().catch(console.dir);
















