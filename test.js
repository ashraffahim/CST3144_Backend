const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

// Create an Express.js instance
const app = express();

// Configure Express.js
app.use(express.json());
app.set('port', 3000);
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers'
  );
  next();
});

// MongoDB URI
const uri = 'mongodb+srv://ashraffahim75:Ashraf12345@atlascluster.v8ty5ip.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster';

// Connect to MongoDB
MongoClient.connect(uri, {}, (err, client) => {
    console.error('Error connecting to MongoDB:', err);
  if (err) {
    process.exit(1); // Exit the process if connection fails
  }

  console.log('Connected to MongoDB');
  const db = client.db('Webstore'); // Use your database name

  // Middleware to set the collection
  app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    next();
  });

  // Routes

  // Display a message for the root path
  app.get('/', (req, res) => {
    res.send('Select a collection, e.g., /collection/messages');
  });

  // Retrieve all objects from a collection
  app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((err, results) => {
      if (err) return next(err);
      res.send(results);
    });
  });

  // Add a new document to a collection
  app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insertOne(req.body, (err, result) => {
      if (err) return next(err);
      res.send(result.ops);
    });
  });

  // Retrieve a document by ID
  app.get('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.findOne({ _id: new ObjectID(req.params.id) }, (err, result) => {
      if (err) return next(err);
      res.send(result);
    });
  });

  // Update a document by ID
  app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.updateOne(
      { _id: new ObjectID(req.params.id) },
      { $set: req.body },
      (err, result) => {
        if (err) return next(err);
        res.send(result.modifiedCount === 1 ? { msg: 'success' } : { msg: 'error' });
      }
    );
  });

  // Delete a document by ID
  app.delete('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.deleteOne({ _id: new ObjectID(req.params.id) }, (err, result) => {
      if (err) return next(err);
      res.send(result.deletedCount === 1 ? { msg: 'success' } : { msg: 'error' });
    });
  });

  // Start the server after successful connection
  app.listen(app.get('port'), () => {
    console.log(`Express.js server running at http://localhost:${app.get('port')}`);
  });
});
