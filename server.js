require( 'dotenv' ).config()

const express = require("express"),
      cookie = require('cookie-session'),
      { MongoClient, ObjectId } = require("mongodb"),
      app = express()

app.use( express.static( "public" ) )
app.use( express.json() )
app.use(express.urlencoded({ extended:true }))

app.use(cookie ({
  name: 'session', //can set properties of this session, can store username here
  keys: ['cookiekey1', 'uniquekey2']
}))

// app.use( function (req, res, next) { //middleware auth check
//   if (req.session.login === true ) {
//     console.log("Logged in")
//     next()
//   }
//   else 
//     console.log("Not logged in, redirect to index")
//     return res.status(302).end()
// })


app.post('/login', (req, res)=> {
  console.log("Login route reached")
  let dataString = ''
    req.on( 'data', function( data ) {
        dataString += data 
    })
    
  req.on( 'end', async function() {
    //console.log(JSON.parse(dataString))
    //console.log(JSON.parse(dataString).password === 'test')
    //verify here that Username is in the db
    if(JSON.parse(dataString).password === 'test'){ //verify password is the one for the username
      req.session.login = true
      res.redirect('/main.html')
  } else {
    res.redirect('/index.html')
  }
  })
})

app.get('/logout', (req, res) => {
  console.log("logout on server side")
  req.session.login = false
  res.redirect('/index.html')
})

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

app.get("/getlist", async (req, res) => { 
  await client.connect()
  let collection = await client.db("ShoppingList").collection("Items")
  let results = await collection.find({})
    .toArray()
  res.send(results)
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

app.post( '/modify', async (req,res) => { 
  let dataString = ''

    req.on( 'data', function( data ) {
        dataString += data 
    })
    
  req.on( 'end', async function() {
    json = JSON.parse(dataString)
    id = json._id
    item = json.item
    cost = json.cost
    count = json.count 
    const result = await collection.updateOne(
    { _id: id },
    { $set:{ item: item, count: count, cost: cost } }
    )
    res.json( result )
  })
  
})

run()

app.listen(3000)