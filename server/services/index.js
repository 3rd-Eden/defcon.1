const EventEmitter = require('events');
const config = require('../config');

/**
 * Base class to build the various of supported services on so we have a
 * consistent interface.
 *
 * @constructor
 * @param {Defcon} defcon Reference to the Defcon instance that created us.
 * @public
 */
class Service extends EventEmitter {
  constructor(defcon) {
    super();

    this.defcon = defcon;
    this.config = config;
  }

  /**
   * Shorthand access for `defcon.storage`.
   *
   * @returns {Storage}
   * @private
   */
  get storage() {
    return this.defcon.storage;
  }

  /**
   * Start the service.
   *
   * @param {Function} fn Completion callback.
   * @public
   */
  start(fn) {
    fn(new Error(`Service(${this.name}) did not implement start method`));
  }

  /**
   * Stop the service.
   *
   * @param {Function} fn Completion callback.
   * @public
   */
  stop(fn) {
    fn(new Error(`Service(${this.name}) did not implement stop method`));
  }
}

//
// Expose the base service.
//
module.exports = Service;
