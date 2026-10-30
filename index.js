import express from 'express'
import { MongoClient } from 'mongodb';
import 'dotenv/config'


const app = express()
const PORT = 8000




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

await connectToMongoDB()



app.listen(PORT, ()=>{
    console.log(`server is running at ${PORT}`);
})

// localhost:8000
app.get('/',(req,res)=>{
    res.send({message:'server runningg'})
})