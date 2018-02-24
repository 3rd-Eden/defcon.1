const config = require('../config');
const path = require('path');
const fs = require('fs');
const os = require('os');

/**
 * Small storage wrapper.
 *
 * @constructor
 * @private
 */
class Storage {
  constructor() {
    this.tmpdir = os.tmpdir();
    this.base = config.get('storage:tmp') || this.tmpdir;
  }

  /**
   * Check if a file exists.
   *
   * @param {String} item Name / location of the item.
   * @param {Function} fn Completion callback.
   * @public
   */
  exists(item, fn) {
    fn(null, false);
  }

  /**
   * Tmp storage of a file locally.
   *
   * @param {String} id Name of the item we want to write locally.
   * @param {Buffer} data Optional data, incase of writing.
   * @param {Function} fn Completion callback.
   * @public
   */
  locally(id, data, fn) {
    const file = path.join(this.tmpdir, id);

    if (typeof data === 'function') {
      return fs.readFile(file, fn);
    }

    //
    // @TODO automatically remove the file.
    //
    fs.writeFile(file, data, fn);
  }
}

//
// Expose the instance.
//
module.exports = Storage;
