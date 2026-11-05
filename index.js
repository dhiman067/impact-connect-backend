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

const mongoClient = await connectToMongoDB()
const db = mongoClient.db("ImpactConnect")
const eventDataCollection = db.collection("eventData")
// const manageEventDataCollection = db.collection("manageEvent")
const joinEventDataCollection = db.collection("joinedEvent")

const verifyApi = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).send({ msg: "Unauthorized" })
  }

  const token = authHeader.split(" ")[1]
  if (!token) {
    return res.status(401).send({ msg: "Unauthorized" })
  }
  const JWKS = createRemoteJWKSet(new URL('http://localhost:3000/api/auth/jwks'))

  const { payload } = await jwtVerify(token, JWKS)
  console.log(payload);

  next()
}


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
app.get('/allEvents', verifyApi, async (req, res) => {
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
app.get('/allEvents/:id', verifyApi, async (req, res) => {
  const id = req.params.id
  const query = { _id: new ObjectId(id) }
  const result = await eventDataCollection.findOne(query)
  res.send(result)
})





// ---------------------
// http://localhost:8000/manageEvent/email
app.get('/manageEvent/:email', verifyApi, async (req, res) => {
  const email = req.params.email
  const result = await eventDataCollection.find({ userEmail: email }).toArray()
  res.send(result)
})

// ----------------------
// http://localhost:8000/joinedEvent
app.post('/joinedEvent', async (req, res) => {
  const data = req.body
  const result = await joinEventDataCollection.insertOne(data)
  res.send(result)
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
app.get('/joinedEvent/:email', verifyApi, async (req, res) => {
  const email = req.params.email
  const result = await joinEventDataCollection.find({ userEmail: email }).toArray()
  res.send(result)
})




// -------------------------
app.get('/', (req, res) => {
  res.send({ message: 'server runningg' })
})