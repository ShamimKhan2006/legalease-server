// scripts/fixClientEmail.js

require('dotenv').config();
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URL);

async function run() {
  await client.connect();
  const db = client.db("legalease");
  const hiringsColl = db.collection("hirings");

  // clientEmail নেই এমন সব hiring fix করো
  const result = await hiringsColl.updateMany(
    { clientEmail: { $exists: false }, userEmail: { $exists: true } },
    [{ $set: { clientEmail: "$userEmail" } }]
  );

  console.log(`✅ Fixed: ${result.modifiedCount} hirings`);
  await client.close();
}
run().catch(console.error);