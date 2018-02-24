const TickTock = require('tick-tock');
const request = require('request');
const RingAPI = require('doorbot');
const ms = require('millisecond');
const async = require('async');
const Service = require('./');

/**
 * Integrate with the RING API.
 *
 * @constructor
 * @public
 */
class Ring extends Service {
  constructor(...args) {
    super(...args);

    this.timers = new TickTock(this);
    this.ring = new RingAPI({
      email: this.config.get('service:ring:username'),
      password: this.config.get('service:ring:password'),
      retries: this.config.get('service:ring:retries') || 10,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36'
    });
  }

  /**
   * Download the recording of ring.
   *
   * @param {String} id The id of the history event.
   * @param {Function} fn Completion callback.
   * @public
   */
  download(id, fn) {
    this.ring.recording(id, (err, uri) => {
      if (err) return fn(err);

      request({ uri }, (err, res, body) => {
        if (err) return fn(err);
        if (res.statusCode !== 200) {
          return fn(new Error('Received invalid status code from AWS'));
        }

        this.storage.locally(id, body, fn);
      });
    });
  }

  /**
   * Fetch the history, check for changes.
   *
   * @param {Function} fn Completion callback.
   * @private
   */
  fetch(fn) {
    this.ring.history((err, history) => {
      if (err) return fn(err);

      async.map(history.slice(0, 1), (item, next) => {
        this.storage.exists(item.id, (err, exists) => {
          if (err) return next(err);
          if (exists) return next(null, item);

          this.download(item.id, next);
        });
      }, fn);
    });
  }

  /**
   * Process any.
   */
  process() {
    this.fetch((err, history) => {
      if (err) throw err;

      console.log(history);
    });
  }

  /**
   * Start the service.
   *
   * @param {Function} fn Completion callback.
   * @public
   */
  start(fn) {
    const interval = ms(this.config.get('services:ring:interval') || 5000);
    this.timers.setInterval('events', this.process, interval);

    fn();
  }

  /**
   * Stop the service.
   *
   * @param {Function} fn Completion callback.
   * @public
   */
  stop(fn) {
    this.timers.clear();

    fn();
  }
}

//
// Expose the Ring Service
//
module.exports = Ring;
