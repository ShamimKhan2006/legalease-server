
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
lawyerFee: lawyer?.hourlyRate || 0, paymentStatus: "unpaid", hiringDate: new Date() };
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
    app.get("/admin/users",  async (req, res) => {
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

    app.delete("/admin/users/:id",async (req, res) => {
      const result = await usersColl.deleteOne({ _id: new ObjectId(req.params.id) });
      res.send(result);
    });

    app.get("/admin/all-transactions", async (req, res) => {
  // ✅ hirings থেকে paid records নিয়ে transaction format-এ পাঠাও
  const result = await hiringsColl.find({ paymentStatus: "paid" }).toArray();
  
  const transactions = result.map((h) => ({
    _id: h._id,
    transactionId: h._id.toString().slice(-8).toUpperCase(),
    userEmail: h.clientEmail || h.userEmail || "—",
    lawyerEmail: h.lawyerEmail || "—",
    amount: (h.lawyerFee || 0) * 110, // USD → BDT (frontend আবার USD-এ convert করবে)
    date: h.hiringDate || h.createdAt,
  }));

  res.send(transactions);
});

   app.get("/admin/analytics", async (req, res) => {
  const totalUsers = await usersColl.countDocuments({ role: "user" });
  const totalLawyers = await usersColl.countDocuments({ role: "lawyer" });
  const totalHires = await hiringsColl.countDocuments({});
  
  // ✅ hirings থেকে lawyerFee sum করো
  const revenueResult = await hiringsColl.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $group: { _id: null, total: { $sum: "$lawyerFee" } } }
  ]).toArray();

  res.send({ 
    totalUsers, 
    totalLawyers, 
    totalHires, 
    totalRevenue: revenueResult[0]?.total || 0 
  });
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
















