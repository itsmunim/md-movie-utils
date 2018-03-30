'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var axios = require('axios');

var BaseClient = function () {
  /**
   * Initialize a specific client.
   * @param {string} apiKey client specific api key
   * @param {string} baseUrl client specific base url
     */
  function BaseClient(apiKey, baseUrl) {
    _classCallCheck(this, BaseClient);

    if (!apiKey) {
      throw new Error('API Key not provided.');
    }

    this._apiKey = apiKey;

    this._httpManager = axios.create({
      baseURL: baseUrl
    });
  }

  _createClass(BaseClient, [{
    key: 'get',


    /**
     * Get a movie by looking up using different params (e.g. title, imdb id, year etc.)
     * @param {object} options
     */
    value: function get(options) {
      throw new Error('Not implemented');
    }

    /**
     * Search for a movie.
     * @param {object} options
     */

  }, {
    key: 'search',
    value: function search(options) {
      throw new Error('Not implemented');
    }
  }, {
    key: '_makeHTTPGET',
    value: function _makeHTTPGET(url, params, headers, responseTransformer) {
      var paramsWithAuth = Object.assign({}, params);
      paramsWithAuth[this.authParam] = this._apiKey;

      var responseTransformers = [JSON.parse];
      if (responseTransformer) {
        responseTransformers.push(responseTransformer);
      }

      return this.httpManager({
        method: 'get',
        url: url,
        params: paramsWithAuth,
        headers: headers,
        transformResponse: responseTransformers
      });
    }
  }, {
    key: '_translateIncomingRequestOptions',
    value: function _translateIncomingRequestOptions(options) {
      var _this = this;

      var translated = {};
      Object.keys(options).forEach(function (key) {
        if (options[key] && _this.requestKeyMap[key]) {
          translated[_this.requestKeyMap[key]] = options[key];
        }
      });
      return translated;
    }
  }, {
    key: 'authParam',
    get: function get() {
      throw new Error('Not implemented');
    }
  }, {
    key: 'httpManager',
    get: function get() {
      return this._httpManager;
    }
  }, {
    key: 'requestKeyMap',
    get: function get() {
      throw new Error('Not implemented');
    }
  }]);

  return BaseClient;
}();

module.exports = BaseClient;