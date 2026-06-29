require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URL);

async function run() {
  await client.connect();
  const db = client.db("legalease");
  const hiringsColl = db.collection("hirings");
  const lawyersColl = db.collection("laywersData");

  // lawyerEmail null এমন সব hiring
  const broken = await hiringsColl.find({
    $or: [{ lawyerEmail: null }, { lawyerEmail: { $exists: false } }]
  }).toArray();

  console.log(`Found ${broken.length} broken hirings\n`);

  for (const h of broken) {
    const lawyer = await lawyersColl.findOne({
      _id: new ObjectId(h.lawyerId)
    });

    if (!lawyer?.email) {
      console.log(`❌ ${h.lawyerName} — email নেই lawyersData-তে`);
      continue;
    }

    await hiringsColl.updateOne(
      { _id: h._id },
      { $set: { lawyerEmail: lawyer.email } }
    );
    console.log(`✅ Fixed: ${h.lawyerName} → ${lawyer.email}`);
  }

  console.log("\n✅ Step 2 done — পুরনো hirings fix হয়েছে");
  await client.close();
}
run().catch(console.error);