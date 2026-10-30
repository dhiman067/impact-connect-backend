import express from 'express'
import { MongoClient } from 'mongodb';
import 'dotenv/config'
import cors from 'cors'

// !--------------!
const app = express()
const PORT = 8000

// !----------------!
app.use(cors())
app.use(express.json())



// !---------------------!
const client = new MongoClient(process.env.MONGODB_URl);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const mongoClient= await connectToMongoDB()
const db = mongoClient.db("ImpactConnect")
const eventDataCollection = db.collection("eventData")


// ---------------------
app.listen(PORT, ()=>{
    console.log(`server is running at ${PORT}`);
})

// http://localhost:8000


// ---------------------------------
app.post('/form-datas', async(req,res)=>{
    const data = req.body

    const result = await eventDataCollection.insertOne(data)
    res.send(result)
})


// -------------------------
app.get('/',(req,res)=>{
    res.send({message:'server runningg'})
})