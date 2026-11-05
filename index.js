import express from 'express'
import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config'
import cors from 'cors'
import { createRemoteJWKSet, jwtVerify } from 'jose';

// !--------------!
const app = express()
const PORT = 8000

// !----------------!
app.use(cors())
app.use(express.json())



// !---------------------!
const client = new MongoClient(process.env.MONGODB_URL);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const mongoClient = await connectToMongoDB()
const db = mongoClient.db("ImpactConnect")
const eventDataCollection = db.collection("eventData")
// const manageEventDataCollection = db.collection("manageEvent")
const joinEventDataCollection = db.collection("joinedEvent")




// ---------------------
app.listen(PORT, () => {
  console.log(`server is running at ${PORT}`);
})

// http://localhost:8000


// ---------------------------------
app.post('/form-datas', async (req, res) => {
  const data = req.body

  const result = await eventDataCollection.insertOne(data)
  res.send(result)
})


// ------------------------------
// http://localhost:8000/allEvents
app.get('/allEvents', async (req, res) => {
  const result = await eventDataCollection.find().toArray()
  res.send(result)
})

// ----------------------------------
// http://localhost:8000/featured-allEvents
app.get('/featured-allEvents', async (req, res) => {
  const result = await eventDataCollection.find().limit(6).toArray()
  res.send(result)
})

// --------------------------
// http://localhost:8000/allEvents/id
app.get('/allEvents/:id',  async (req, res) => {
  const id = req.params.id
  const query = { _id: new ObjectId(id) }
  const result = await eventDataCollection.findOne(query)
  res.send(result)
})





// ---------------------
// http://localhost:8000/manageEvent/email
app.get('/manageEvent/:email', async (req, res) => {
  const email = req.params.email
  const result = await eventDataCollection.find({ userEmail: email }).toArray()
  res.send(result)
})

// ----------------------
// http://localhost:8000/joinedEvent
app.post('/joinedEvent', async (req, res) => {
  const data = req.body

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return res.status(400).send({ message: 'A valid JSON object is required' })
  }

  try {
    const result = await joinEventDataCollection.insertOne(data)
    res.status(201).send(result)
  } catch (error) {
    console.error('Failed to save joined event:', error)
    res.status(500).send({ message: 'Failed to save joined event' })
  }
})

app.get('/joinedEvent', async (_req, res) => {
  try {
    const result = await joinEventDataCollection.find().toArray()
    res.send(result)
  } catch (error) {
    console.error('Failed to load joined events:', error)
    res.status(500).send({ message: 'Failed to load joined events' })
  }
})

// --------------------------------
// http://localhost:8000/allEvents/:id
app.patch('/allEvents/:id', async (req, res) => {
  const { id } = req.params
  const updatedData = req.body
  const result = await eventDataCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedData }
  )
  res.send(result)
})


// --------------------------------------
app.delete('/allEvents/:id', async (req, res) => {
  const { id } = req.params
  const result = await eventDataCollection.deleteOne({ _id: new ObjectId(id) })
  res.send(result)
})



// --------------------------
// http://localhost:8000/joinedEvent/email
app.get('/joinedEvent/:email', async (req, res) => {
  const email = req.params.email

  try {
    const result = await joinEventDataCollection.find({ userEmail: email }).toArray()
    res.send(result)
  } catch (error) {
    console.error('Failed to load joined events for email:', error)
    res.status(500).send({ message: 'Failed to load joined events' })
  }
})




// -------------------------
app.get('/', (req, res) => {
  res.send({ message: 'server runningg' })
})

export default app