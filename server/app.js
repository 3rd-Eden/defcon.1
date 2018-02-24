const debug = require('diagnostics')('defcon');
const Ring = require('./services/ring');
const connected = require('connected');
const EventEmitter = require('events');
const Storage = require('./storage');
const config = require('./config');
const async = require('async');
const http = require('http');

/**
 * All the different services that Defcon supports, can be turned on and off.
 *
 * @type {Object}
 * @private
 */
const services = {
  'ring': Ring
};

/**
 * Defcon Service.
 *
 * @constructor
 * @private
 */
class Defcon extends EventEmitter {
  constructor() {
    super();

    this.services = {};
    this.storage = new Storage();
    this.incoming = this.incoming.bind(this);
    this.server = http.createServer(this.incoming);
  }

  /**
   * Start all configured services.
   *
   * @param {Function} fn Completion callback.
   * @private
   */
  start(fn) {
    async.each(Object.keys(config.get('service')), (name, next) => {
      debug(`configuring service(${name})`);

      console.log(name);

      const Service = services[name];
      const service = new Service(this);

      service.start((err) => {
        if (err) return next(err);

        this.services[name] = service;
        next();
      });
    }, fn);
  }

  /**
   * Stop all active services.
   *
   * @param {Function} fn Completion callback.
   * @private
   */
  stop(fn) {
    async.each(Object.keys(this.services), (name, next) => {
      debug(`shutting down service(${name})`);

      const service = this.services[name];
      delete this.services[name];

      service.stop(next);
    }, fn);
  }

  /**
   * Handle incoming HTTP requests.
   *
   * @param {Request} req Incoming HTTP request.
   * @param {Response} res Outgoing HTTP response.
   * @private
   */
  incoming(req, res) {
    debug('incoming http request');
  }

  /**
   * Listen and start the HTTP server.
   *
   * @param {Function} fn Completion callback.
   * @public
   */
  listen(fn) {
    connected(this.server, config.get('port'), (err) => {
      if (err) return fn(err);

      this.start(fn);
    });
  }
}

//
// Expose the App.
//
module.exports = Defcon;
