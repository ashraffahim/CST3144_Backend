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
    console.log('Serviing request: ' + request.url);

    let db;

    MongoClient.connect('mongodb+srv://ashraffahim75:Ashraf12345@atlascluster.v8ty5ip.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster')
        .then(client => {
            db = client.db('webstore');
            request.db = db;
            return next();
        });
});

app.get('/products/:filter?', async (request, response, next) => {
    let filter = {};

    if (request.params.filter) {
        filter = {
            $or: [
                { "title": new RegExp(`.*${request.params.filter}.*`, 'i') },
                { "description": new RegExp(`.*${request.params.filter}.*`, 'i') },
                { "price": new RegExp(`.*${request.params.filter}.*`, 'i') }
            ]
        };
    }

    response.send(await request.db.collection('product').find(filter).toArray());
});

app.post('/orders', async (request, response, next) => {
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

    const insertedDoc = await request.db.collection('order').insertOne(doc);

    if (insertedDoc.insertedId) {
        response.send({ success: 1 }).status(200);
    } else {
        response.send({ success: 0 }).status(500);
    }
});

app.put('/orders/:id', async (request, response, next) => {
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

    const insertedDoc = await request.db.collection('order').insertOne(doc);

    if (insertedDoc.insertedId) {
        response.send({ success: 1 }).status(200);
    } else {
        response.send({ success: 0 }).status(500);
    }
});

app.delete('/orders/:id', async (request, response, next) => {
    const { acknowledged, deletedCount } = await request.db.collection('order').deleteOne({ _id: new ObjectId(request.params.id) });

    if (deletedCount > 0) {
        response.send({ success: 1 }).status(200);
    } else {
        response.send({ success: 0 }).status(500);
    }
});

app.listen(3000, () => { console.log('Listening to port 3000'); })
