//2JhTA6oPSr7gkXCj
//mongodb+srv://WebstoreUser:<password>@cluster0.f4ryres.mongodb.net/?retryWrites=true&w=majority

const express = require('express');
const fs = require('fs').promises; // Use promises for fs operations
const path = require('path');
const PORT = 3000;
const cors = require('cors');

const app = express();

const dataFilePath = path.join(__dirname, 'data.json');

// Middleware to handle errors
const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
};

// Ignore favicon requests
app.get('/favicon.ico', (req, res) => res.status(204));

// Error handling middleware
app.use(cors());
app.use(errorHandler);
app.use(express.json());
// Serve static files
// app.use(express.static('C:\\Users\\Justin\\static'));


  let propertiesReader = require("properties-reader");
  let propertiesPath = path.resolve(__dirname, "conf/db.properties");
  let properties = propertiesReader(propertiesPath);
  let dbPprefix = properties.get("db.prefix");
  //URL-Encoding of User and PWD
  //for potential special characters
  let dbUsername = encodeURIComponent(properties.get("db.user"));
  let dbPwd = encodeURIComponent(properties.get("db.pwd"));
  let dbName = properties.get("db.dbName");
  let dbUrl = properties.get("db.dbUrl");
  let dbParams = properties.get("db.params");
  const uri = dbPprefix + dbUsername + ":" + dbPwd + dbUrl + dbParams;
  
  const { MongoClient, ServerApiVersion } = require("mongodb");
  const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
  let db = client.db(dbName);

  // Start the application 
async function startServer() {
  try {
    await client.connect();
    console.log('Connected to the MongoDB cluster');
    
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

	startServer();
	app.param("collectionName", async function (req, res, next, collectionName) {
	  try {
		console.log("Connecting to " + dbName + " reading " + collectionName);
		req.collection = client.db(dbName).collection(collectionName);
		await client.connect(); 
		return next();
	  } catch (error) {
		return next(error);
	  }
	});

	app.get('/collections/:collectionName', async function (req, res, next) {
	  try {
		const results = await req.collection.find({}).toArray();
		console.log(results);
		res.send(results);
	  } catch (error) {
		return next(error);
	  }
	});

	app.get('/collections/:collectionName/:max/:sortAspect/:sortAscDesc'
	, function(req, res, next) {
	// TODO: Validate params
	var max = parseInt(req.params.max, 10); // base 10
	let sortDirection = 1;
	if (req.params.sortAscDesc === "desc") {
	 sortDirection = -1;
	}
	req.collection.find({}, {limit: max, sort: [[req.params.sortAspect,
	sortDirection]]}).toArray(function(err, results) {
	 if (err) {
	 return next(err);
	 }
	 res.send(results);
	 });
	});
