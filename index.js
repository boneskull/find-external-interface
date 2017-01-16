'use strict';

/**
 * This module exports a single function, {@link findExternalInterface}.
 * @module find-external-interface
 */

var os = require('os');

/**
 * Find the name of a network interface bound to an external (non-localhost) IP
 * address or `null` if none found.  This function returns the name of the
 * first
 * interface which satisfies the criteria.
 * @param {Object} [options] Options
 * @param {boolean} [options.IPv6=false] If true, find IPv6 interface
 * @param {string} [options.name] If set, only check interface w/ this name for
 *   external address
 * @returns {?string} Interface name
 * @example
 * const {findExternalInterface} = require('find-external-interface');
 * const name = findExternalInterface(); // 'eth0'
 * const info = require('os').networkInterfaces(name); // ip address, etc.
 */
exports.findExternalInterface = function findExternalInterface (options) {
  function findInAddresses (addresses) {
    return addresses.reduce((externalAddress, address) => externalAddress ||
    (!address.internal && address.family === family && address), null);
  }

  options = options || {};
  var family = options.IPv6 ? 'IPv6' : 'IPv4';
  var networkInterfaces = os.networkInterfaces();
  var name = options.name;

  if (name) {
    return findInAddresses(networkInterfaces[name]) ? name : null;
  }

  return Object.keys(networkInterfaces)
    .reduce((externalInterface, interfaceName) => {
      if (externalInterface) {
        return externalInterface;
      }

      return findInAddresses(networkInterfaces[interfaceName], {
        internal: false,
        family: family
      }) ? interfaceName : null;
    }, null);
}
