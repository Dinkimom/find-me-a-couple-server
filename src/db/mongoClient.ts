import { MongoClient } from 'mongodb';

const CONNECTION_STRING = process.env.CONNECTION_STRING || '';

let mongo = new MongoClient(CONNECTION_STRING);

mongo.connect((err, client) => {
  if (err) return console.log(err);

  mongo = client;
});

export const mongoClient = mongo;
