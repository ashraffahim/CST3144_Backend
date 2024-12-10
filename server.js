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
    console.log('Serving request: ' + request.method + ' ' + request.url);

    MongoClient.connect('mongodb+srv://ashraffahim75:Ashraf12345@atlascluster.v8ty5ip.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster')
        .then(client => {
            request.db = client.db('webstore');
            
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

app.get('/orders', async (request, response, next) => {
    response.send(await request.db.collection('order').find({}).toArray());
});

app.post('/orders', async (request, response, next) => {
    const doc = { ...request.body };

    const productQtys = {};

    doc.products.forEach(product => {
        if (!productQtys[product]) productQtys[product] = 0;

        productQtys[product]++;
    });

    for (const key in productQtys) {
        const { matchedCount } = await request.db.collection('product').updateOne({ _id: new ObjectId(key), place: { "$gte": parseInt(productQtys[key]) } }, { $inc: { place: -1 * parseInt(productQtys[key]) } });

        if (matchedCount === 0) {
            console.log('Activity is not available: ' + key);

            delete productQtys[key];
        }
    }

    if (Object.keys(productQtys).length) {
        doc.products = productQtys;
        const insertedDoc = await request.db.collection('order').insertOne(doc);

        if (insertedDoc.insertedId) {
            return response.send({ success: 1 }).status(200);
        }
    }

    response.send({ success: 0 }).status(500);

});

app.put('/orders/:id', async (request, response, next) => {

    const order = await request.db.collection('order').findOne({ _id: new ObjectId(request.params.id) });

    if (order === null) {
        return response.status(404).send({ message: 'Order not found' });
    }

    const doc = { ...request.body };

    const productQtys = {};

    doc.products.forEach(product => {
        if (!productQtys[product]) productQtys[product] = 0;

        productQtys[product]++;
    });

    Object.entries(order.products).forEach(async ([id, qty]) => {
        const { matchedCount } = await request.db.collection('product').updateOne({ _id: new ObjectId(id), place: { $gte: (parseInt(qty) - (productQtys[id] ?? 0 )) } }, { $inc: { place: (parseInt(qty) - (productQtys[id] ?? 0 )) } });

        if (matchedCount === 0) {
            console.log('Activity is not available: ' + id);

            delete productQtys[id];
        }
    });

    if (Object.keys(productQtys).length === 0) {
        return response.status(400).send({ message: 'Activities cannot be updated' });
    }
    
    const { matchedCount } = await request.db.collection('order').updateOne({ _id: new ObjectId(request.params.id) }, { $set: { products: productQtys } });

    if (matchedCount > 0) {
        response.send({ success: 1 }).status(200);
    } else {
        response.send({ success: 0 }).status(500);
    }
});

app.delete('/orders/:id', async (request, response, next) => {

    const order = await request.db.collection('order').findOne({ _id: new ObjectId(request.params.id) });

    if (order === null) {
        return response.status(404).send({ message: 'Order not found' });
    }

    Object.entries(order.products).forEach(async ([id, qty]) => {
        const { matchedCount } = await request.db.collection('product').updateOne({ _id: new ObjectId(id) }, { $inc: { place: qty } });
    });

    const { deletedCount } = await request.db.collection('order').deleteOne({ _id: new ObjectId(request.params.id) });

    if (deletedCount > 0) {
        response.send({ success: 1 }).status(200);
    } else {
        response.send({ success: 0 }).status(500);
    }
});

app.listen(3000, () => { console.log('Listening to port 3000'); })
