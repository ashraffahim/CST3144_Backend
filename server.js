const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const { ObjectId } = require('mongodb');
const app = express();

app.use(express.static('public'));

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    return next();
});

app.use((request, response, next) => {
    console.log(request.url);
    // response.writeHead(200, { 'Content-Type': 'application/json' });
    return next();
});

app.param('collection', async (request, response, next, collection) => {
    let db;

    MongoClient.connect('mongodb+srv://ashraffahim75:Ashraf12345@atlascluster.v8ty5ip.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster')
        .then(client => {
            db = client.db('webstore');
            request.db = db;
            request.collection = db.collection(collection);
            return next();
        });
});

app.get('/:collection', async (request, response, next) => {
    response.send(await request.collection.find({}).toArray());
});

app.post('/:collection', async (request, response, next) => {
    const doc = { ...request.body };

    const productQtys = {};

    doc.products.forEach(product => {
        if (!productQtys[product]) productQtys[product] = 0;

        productQtys[product]++;
    });

    for (const key in productQtys) {
        const { matchedCount, upsertedCount } = await request.db.collection('product').updateOne({ _id: new ObjectId(key) }, { $inc: { inventory: -1 * parseInt(productQtys[key]) } });
        console.log({ matchedCount, upsertedCount });
    }

    doc.products = productQtys;

    const insertedDoc = await request.collection.insertOne(doc);

    if (insertedDoc.insertedId) {
        response.send({ success: 1 }).status(200);
    } else {
        response.send({ success: 0 }).status(500);
    }
});

app.delete('/:collection/:id', async (request, response, next) => {
    const { acknowledged, deletedCount } = await request.collection.deleteOne({ _id: new ObjectId(request.params.id) });

    if (acknowledged) {
        response.send({ success: 1, deletedCount }).status(200);
    } else {
        response.send({ success: 0, deletedCount }).status(500);
    }
});

app.listen(3000, () => { console.log('Listening to port 3000'); })
