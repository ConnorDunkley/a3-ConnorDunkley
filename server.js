require( 'dotenv' ).config()

const express = require("express"),
      { MongoClient, ObjectId } = require("mongodb"),
      app = express()

app.use( express.static( "public" ) )
app.use( express.json() )

const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URI}`
// check for sanity
console.log( 'uri:', uri )
const client = new MongoClient( uri )

let collection = null //collection is global

async function run() {
  await client.connect()
  collection = await client.db("ShoppingList").collection("Items")
  // route to get all docs
  app.get("/docs", async (req, res) => {
    if (collection !== null) {
      const docs = await collection.find({}).toArray()
      res.json( docs )
    }
  })
}
//need 3 routes, getlist, submit, delete

app.post( '/delete', async (req,res) => {
  let dataString = ''

    req.on( 'data', function( data ) {
        dataString += data 
    })
    req.on( 'end', async function() {
    myId = JSON.parse(dataString)._id
    console.log(myId)
  const result = await collection.deleteOne({ 
    "_id": myId //new ObjectId( myId ) 
  })
  
  res.json( result )
  })
})

app.get("/getlist", async (req, res) => { //error happens here
  await client.connect()
  let collection = await client.db("ShoppingList").collection("Items")
  let results = await collection.find({})
    .toArray()
  res.send(results).status(200)
})

app.post( '/submit', async (req,res) => {
  let dataString = ''

    req.on( 'data', function( data ) {
        dataString += data 
    })
    
    req.on( 'end', async function() {
        //console.log(JSON.parse(dataString))
        
        
        
          result = await collection.insertOne( JSON.parse(dataString) )
        
        
        res.json( result )
    })
  
})

// app.post( '/update', async (req,res) => { //as of now unimplemented
//   const result = await collection.updateOne(
//     { _id: new ObjectId( req.body._id ) },
//     { $set:{ name:req.body.name } }
//   )

//   res.json( result )
// })

run()

app.listen(3000)