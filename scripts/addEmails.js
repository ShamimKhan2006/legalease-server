require('dotenv').config();
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URL);

async function run() {
  await client.connect();
  const db = client.db("legalease");
  const lawyersColl = db.collection("laywersData");

  // সব lawyer নিয়ে আসো
  const lawyers = await lawyersColl.find({}).toArray();
  console.log(`Total lawyers found: ${lawyers.length}`);

  for (const lawyer of lawyers) {
    // email না থাকলেই শুধু add করো
    if (!lawyer.email) {
      // "Daniel Wilson" → "daniel.wilson@legalease.com"
      const email = lawyer.name
        .toLowerCase()
        .replace(/\s+/g, ".")
        + "@legalease.com";

      await lawyersColl.updateOne(
        { _id: lawyer._id },
        { $set: { email } }
      );
      console.log(`✅ ${lawyer.name} → ${email}`);
    } else {
      console.log(`⏭️  ${lawyer.name} → already has email: ${lawyer.email}`);
    }
  }

  console.log("\n🎉 Done!");
  await client.close();
}
run().catch(console.error);