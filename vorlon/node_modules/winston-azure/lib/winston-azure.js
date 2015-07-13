/*!
 * winston-azure
 * Copyright(c) 2014 Thomas Decaux <ebuildy@gmail.com>
 * Apache 2.0 Licensed
 */

var util = require('util'),
    azure = require('azure-storage'),
    winston = require('winston')

var WinstonAzure = exports.WinstonAzure = function (options) {

    winston.Transport.call(this, options);

    options = options || {};

    this.name = 'azure';
    this.tableName = options.table || 'log';
    this.level = options.level || 'info';
    this.silent = options.silent || false;
    this.metaAsColumns = options.metaAsColumns || false;
    this.partition = options.partition || 'log';
    this.rowKeyBuilder = options.rowKeyBuilder || function()
    {
        return (new Date()).getTime() + '_' + (new Date()).getMilliseconds();
    };

    this.tableService = azure.createTableService(options.account, options.key);
    this.entityGenerator = azure.TableUtilities.entityGenerator;
};

util.inherits(WinstonAzure, winston.Transport);

winston.transports.Azure = WinstonAzure;

WinstonAzure.prototype.createTableIfNotExists = function(callback)
{
    this.tableService.createTableIfNotExists(this.tableName, function(error)
    {
        callback(error);
    });
};

WinstonAzure.prototype.log = function (level, msg, meta, callback) {

    if (this.silent) {
        return callback(true);
    }

    var entity = {
        PartitionKey: this.entityGenerator.String(this.partition),
        RowKey: this.entityGenerator.String(this.rowKeyBuilder()),
        level: this.entityGenerator.String(level),
        message: this.entityGenerator.String(msg)
    };

    if (meta)
    {
        if (this.metaAsColumns)
        {
            for (var prop in meta)
            {
                if (typeof meta[prop] === 'object') {
                    entity[prop] = this.entityGenerator.String(JSON.stringify(meta[prop]));
                } else {
                    entity[prop] = this.entityGenerator.String(meta[prop]);
                }
            }
        }
        else
        {
            entity.meta = this.entityGenerator.String(JSON.stringify(meta));
        }
    }

    this.tableService.insertEntity(this.tableName, entity, function(err) {

        if (err) {
            throw err;
        }

        //self.emit('logged', rowKey);


        callback(entity.RowKey);

    });
};

WinstonAzure.prototype.explore = function(limit, callback)
{
    var query = new azure.TableQuery()
        .top(limit || 10)
        .where('PartitionKey eq ?', this.partition);

    this.tableService.queryEntities(this.tableName, query, null, function(error, result, response) {

        if (error)
        {
            throw error;
        }

        callback(result);
    });
};
