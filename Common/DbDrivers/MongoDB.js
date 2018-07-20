/*global __logging*/
/*global __formatError*/

const _         = require('lodash/core'),
      Library   = require('mongodb');

class Mongo {

  constructor() {

    const dbConfig = {
      poolSize: process.env.DB_POOL_SIZE || 100,
      autoReconnect: process.env.DB_AUTORECONNECT || true,
      reconnectTries: process.env.DB_REcollection_RETRIES || 10,
      socketTimeoutMS: process.env.DB_TIMEOUT || 60000,
      promiseLibrary: Promise
    };

    const connectionUri = this.CreateConnectionUri();

    Library.connect(connectionUri, dbConfig)
    .then( (db) => {

      this.Db = db;

    })
    .catch( (e) => {

      throw e;

    });

  }

  async CreateConnection(collection) {

    try {

      return this.Db.collection(collection);

    }

    catch(e) {

      __logging.error(e);
      return null;

    }

  }

  CreateConnectionUri() {

    let up        = '',
        host      = process.env.DB_HOST,
        port      = '',
        dbName    = `/${process.env.DB_NAME}`,
        authMech  = '';

    if (_.isString(process.env.DB_USERNAME) && _.isString(process.env.DB_PASSWORD)) {

      up = `${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@`;
      authMech = '?authMechanism=DEFAULT';

    }

    if (_.isString(process.env.DB_PORT)) {

      port = `:${process.env.DB_PORT}`;

    }

    return `mongodb://${up}${host}${port}${dbName}${authMech}`;

  }

  async Insert(collection, document) {

    if (!_.isString(collection) || _.isEmpty(collection)) {

      return __formatError('Invalid collection format provided');

    }

    if (!_.isObject(document)) {

      return __formatError('Invalid document format provided');

    }

    try {

      let connection = await this.CreateConnection(collection);
      let result  = await connection.insertOne(document);

      if (result.insertedCount !== 1) {

        return __formatError('There was an error inserting the document');

      }

      return [null, document];

    }

    catch (e) {

      __logging.error(e);
      return __formatError('There was an error inserting the document');

    }

  }

  async BulkInsert(collection, documents) {

    if (!_.isString(collection) || _.isEmpty(collection)) {

      return __formatError('Invalid collection format provided');

    }

    if (!_.isArray(documents)) {

      return __formatError('An array of documents should be provided');

    }

    try {

      let connection = await this.CreateConnection(collection);
      let result  = await connection.insertMany(documents);

      if (result.insertedCount !== documents.length) {

        return __formatError('There was an error inserting some documents');

      }

      return [null, documents];

    }

    catch (e) {

      __logging.error(e);
      return __formatError('There was an error inserting the documents');

    }

  }

  async Get(collection, query) {

    if (!_.isString(collection) || _.isEmpty(collection)) {

      return __formatError('Invalid collection format provided');

    }

    if (!_.isObject(query)) {

      return __formatError('Invalid query format provided');

    }

    try {

      let connection = await this.CreateConnection(collection);
      let result = await connection.findOne(query);

      if (!_.isObject(result)) {

        return __formatError('There was an error fetching the document');

      }

      return [null, result];

    }

    catch (e) {

      __logging.error(e);
      return __formatError('There was an error fetching the document');

    }

  }

  async Search(collection, query) {

    if (!_.isString(collection) || _.isEmpty(collection)) {

      return __formatError('Invalid collection format provided');

    }

    if (!_.isObject(query)) {

      return __formatError('Invalid query format provided');

    }

    try {

      let connection = await this.CreateConnection(collection);
      let results = await connection.find(query).toArray();

      return [null, results];

    }

    catch (e) {

      __logging.error(e);
      return __formatError('There was an error searching the documents');

    }

  }

  async Update(collection, query, document) {

    if (!_.isString(collection) || _.isEmpty(collection)) {

      return __formatError('Invalid collection format provided');

    }

    if (!_.isObject(query)) {

      return __formatError('Invalid query format provided');

    }

    if (!_.isObject(document)) {

      return __formatError('Invalid document format provided');

    }

    try {

      let connection = await this.CreateConnection(collection);
      let result = await connection.updateOne(query, document, {upsert: true});

      if (result.modifiedCount !== 1) {

        return __formatError('There was an error updating the document');

      }

      return [null];

    }

    catch (e) {

      __logging.error(e);
      return __formatError('There was an error updating the document');

    }

  }

  async BulkUpdate(collection, queries, documents) {

    if (!_.isString(collection) || _.isEmpty(collection)) {

      return __formatError('Invalid collection format provided');

    }

    if (!_.isArray(queries)) {

      return __formatError('Invalid queries format provided');

    }

    if (!_.isArray(documents)) {

      return __formatError('Invalid documents format provided');

    }

    try {

      let connection = await this.CreateConnection(collection);
      let result = await connection.updateMany(queries, documents, {upsert: true});

      if (result.modifiedCount < 1) {

        return __formatError('There was an error updating some of the documents');

      }

      return [null];

    }

    catch (e) {

      __logging.error(e);
      return __formatError('There was an error updating the documents');

    }

  }

  async Delete(collection, query = null) {

    if (!_.isString(collection) || _.isEmpty(collection)) {

      return __formatError('Invalid collection format provided');

    }

    if (_.isNull(query)) {

      return __formatError('Invalid query format provided');

    }

    try {

      let connection = await this.CreateConnection(collection);
      let result = await connection.deleteOne(query);

      if (result.deletedCount !== 1) {

        return __formatError('There was an error deleting the document');

      }

      return [null];

    }

    catch (e) {

      __logging.error(e);
      return __formatError('There was an error deleting the document');

    }

  }

  async BulkDelete(collection, query) {

    if (!_.isString(collection) || _.isEmpty(collection)) {

      return __formatError('Invalid collection format provided');

    }

    if (!_.isObject(query)) {

      return __formatError('Invalid query format provided');

    }

    try {

      let connection = await this.CreateConnection(collection);
      let result = await connection.deleteMany(query);

      if (result.deletedCount < 1) {

        return __formatError('There was an error deleting the documents');

      }

      return [null];

    }

    catch (e) {

      __logging.error(e);
      return __formatError('There was an error updating the document');

    }

  }

}

module.exports = Mongo;