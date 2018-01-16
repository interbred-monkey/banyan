/*global __logging*/
/*global __formatError*/

const _         = require('lodash/core'),
      Library   = require('pg');

class PostgreSQL {

  constructor() {

    const dbConfig = {
      connectionTimeoutMillis: process.env.DB_TIMEOUT || 60000,
      connectionString: this.CreateConnectionUri()
    };

    this.Db = new Library.Pool(dbConfig);

  }

  CreateConnectionUri() {

    let up        = '',
        host      = process.env.DB_HOST,
        port      = '',
        dbName    = `/${process.env.DB_NAME}`;

    if (_.isString(process.env.DB_USERNAME) && _.isString(process.env.DB_PASSWORD)) {

      up = `${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@`;

    }

    if (_.isString(process.env.DB_PORT)) {

      port = `:${process.env.DB_PORT}`;

    }

    return `postgresql://${up}${host}${port}${dbName}`;

  }

  UseCollection(collection) {

    if (!_.isUndefined(this[collection])) {

      return;

    }

    this.Db.connect()
    .then( (client) => {

      this[collection] = client;

    })
    .catch( (e) => {

      __logging.error(e);
      return __formatError('There was an error connecting to the DB');

    });

  }

  GenerateWhere(query, conditional = '=', operand = 'AND') {

    if (!_.isString(query) && !_.isObject(query)) {

      return '';

    }

    if (_.isString(query)) {

      return query;

    }

    let where = [];

    Object.entries(query).forEach( ({key, value}) => {

      where.push(`${key} ${conditional} "${value}"`);

    });

    return `WHERE
              ${where.join(` ${operand} `)};`;

  }

  GenerateInsert(collection, document) {

    if (!_.isObject(document)) {

      return '';

    }

    return `INSERT INTO ${collection}
              (${Object.keys(document).join(', ')}
            VALUES
              (${Object.values(document).join('", "')});`;

  }

  GenerateReplace(collection, document, query = '') {

    if (!_.isObject(document)) {

      return '';

    }

    query = this.GenerateWhere(query);

    return `REPLACE INTO ${collection}
              (${Object.keys(document).join(', ')}
            VALUES
              (${Object.values(document).join('", "')})
            ${query};`;

  }

  GenerateDelete(collection, query = '') {

    query = this.GenerateWhere(query);

    return `DELETE FROM ${collection}
            ${query};`;

  }

  GenerateSelect(collection, fields = '*', query = '') {

    (_.isArray(fields)?fields = fields.join(', '):'');
    query = this.GenerateWhere(query);

    return `SELECT ${fields} FROM ${collection}
            ${query};`;

  }

  async Insert(collection, document, terminateConnection = true) {

    if (!_.isObject(document)) {

      return __formatError('Invalid document format provided');

    }

    try {

      const statement = this.GenerateInsert(collection, document);
      let result  = await this[collection].query(statement);
      (terminateConnection === true?this[collection].release():'');

      if (!_.isArray(result.rows) || result.rows.length !== 1) {

        return __formatError('There was an error inserting the document');

      }

      return [null, document];

    }

    catch (e) {

      __logging.error(e);
      return __formatError('There was an error inserting the document');

    }

  }

  async BulkInsert(collection, documents, terminateConnection = true) {

    if (!_.isArray(documents)) {

      return __formatError('An array of documents should be provided');

    }

    try {

      let statements = [];
      documents.map( (document) => {

        statements.push(this.GenerateInsert(collection, document));

      });

      let result  = await this[collection].query(statements.join(' '));
      (terminateConnection === true?this[collection].release():'');

      if (!_.isArray(result.rows) || result.rows.length !== documents.length) {

        return __formatError('There was an error inserting the documents');

      }

      return [null, documents];

    }

    catch (e) {

      __logging.error(e);
      return __formatError('There was an error inserting the documents');

    }

  }

  async Get(collection, query = null, fields = null, terminateConnection = true) {

    if (!_.isObject(query) && !_.isString(query)) {

      return __formatError('Invalid query format provided');

    }

    try {

      const statement = (_.isString(query)?query:this.GenerateSelect(collection, fields, query));
      let result  = await this[collection].query(statement);
      (terminateConnection === true?this[collection].release():'');

      if (!_.isArray(result.rows) || result.rows.length === 0) {

        return __formatError('There was an error fetching the document');

      }

      return [null, result.rows[0]];

    }

    catch (e) {

      __logging.error(e);
      return __formatError('There was an error fetching the document');

    }

  }

  async Search(collection, query = null, fields = null, terminateConnection = true) {

    if (!_.isObject(query) && !_.isString(query)) {

      return __formatError('Invalid query format provided');

    }

    try {

      const statement = (_.isString(query)?query:this.GenerateSelect(collection, fields, query));
      let result  = await this[collection].query(statement);
      (terminateConnection === true?this[collection].release():'');

      if (!_.isArray(result.rows) || result.rows.length < 1) {

        return __formatError('There was an error fetching the documents');

      }

      return [null, result.rows];

    }

    catch (e) {

      __logging.error(e);
      return __formatError('There was an error searching the documents');

    }

  }

  async Update(collection, query, document, terminateConnection = true) {

    if (!_.isObject(query) && !_.isString(query)) {

      return __formatError('Invalid query format provided');

    }

    if (!_.isObject(document)) {

      return __formatError('Invalid document format provided');

    }

    try {

      const statement = this.GenerateReplace(collection, document, query);
      let result  = await this[collection].query(statement);
      (terminateConnection === true?this[collection].release():'');

      if (!_.isArray(result.rows) || result.rows.length !== 1) {

        return __formatError('There was an error updating the document');

      }

      return [null];

    }

    catch (e) {

      __logging.error(e);
      return __formatError('There was an error updating the document');

    }

  }

  async BulkUpdate(collection, query, documents, terminateConnection = true) {

    if (!_.isObject(query) && !_.isString(query)) {

      return __formatError('Invalid queries format provided');

    }

    if (!_.isArray(documents)) {

      return __formatError('Invalid documents format provided');

    }

    try {

      let statements = [];
      documents.map( (document) => {

        statements.push(this.GenerateReplace(collection, document, query));

      });

      let result  = await this[collection].query(statements);
      (terminateConnection === true?this[collection].release():'');

      if (!_.isArray(result.rows) || result.rows.length !== documents.length) {

        return __formatError('There was an error updating the documents');

      }

      return [null];

    }

    catch (e) {

      __logging.error(e);
      return __formatError('There was an error updating the documents');

    }

  }

  async Delete(collection, query = null, terminateConnection = true) {

    if (!_.isObject(query) && !_.isString(query)) {

      return __formatError('Invalid query format provided');

    }

    try {

      const statement = this.GenerateDelete(collection, query).replace(/;$/, ' LIMIT 1;');
      let result  = await this[collection].query(statement);
      (terminateConnection === true?this[collection].release():'');

      if (!_.isArray(result.rows) || result.rows.length !== 1) {

        return __formatError('There was an error deleting the document');

      }

      return [null];

    }

    catch (e) {

      __logging.error(e);
      return __formatError('There was an error deleting the document');

    }

  }

  async BulkDelete(collection, query, terminateConnection = true) {

    if (!_.isObject(query) && !_.isString(query)) {

      return __formatError('Invalid query format provided');

    }

    try {

      const statement = this.GenerateDelete(collection, query);
      let result  = await this[collection].query(statement);
      (terminateConnection === true?this[collection].release():'');

      if (!_.isArray(result.rows) || result.rows.length !== 1) {

        return __formatError('There was an error deleting the document');

      }

      return [null];

    }

    catch (e) {

      __logging.error(e);
      return __formatError('There was an error updating the document');

    }

  }

}

module.exports = PostgreSQL;