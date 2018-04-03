'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var axios = require('axios');
var utils = require('../utils');
var BaseClient = require('./base.client');

/**
 * Open Movie Database API Client.
 * @extends BaseClient
 */

var OMDBAPIClient = function (_BaseClient) {
  _inherits(OMDBAPIClient, _BaseClient);

  /**
   * @param {string} apiKey The omdb api key ([Ref]{@link http://www.omdbapi.com/apikey.aspx})
   * @param baseUrl Base url for omdb api
     */
  function OMDBAPIClient(apiKey, baseUrl) {
    _classCallCheck(this, OMDBAPIClient);

    return _possibleConstructorReturn(this, (OMDBAPIClient.__proto__ || Object.getPrototypeOf(OMDBAPIClient)).call(this, apiKey, baseUrl));
  }
  /**
   * Get omdb client instance.
   * @param {string} apiKey The omdb api key
   * @returns {OMDBAPIClient}
   */


  _createClass(OMDBAPIClient, [{
    key: 'get',


    /**
     * Get a media(movie/series) by looking up using different params (e.g. title, imdb id, year etc.)
     * @param {object} options The options based on which the movie will be fetched.
     * @example
     * get({title: 'Saw', year: 2004, plot: 'short', format: 'xml', type: 'movie'})
     * @example
     * get({imdbID: 'tt12444'})
     * @returns {Promise}
     * @fulfil {object} - The movie/series object.
     * @reject {Error} - The error with an appropriate `message`.
     */
    value: function get(options) {
      if (!options.imdbID) {
        if (!options.title || !options.year || !options.type) {
          throw new Error('Either one of the format of data must be provided: imdbID | (title, year, type)');
        }
      }

      var reqOptions = this._translateIncomingRequestOptions(options);
      reqOptions.plot = reqOptions.plot || 'full';
      reqOptions.format = reqOptions.format || 'json';

      return this._makeHTTPGET('', reqOptions, null, this._transformResponse.bind(this)).then(function (resp) {
        return resp.data;
      });
    }

    /**
     * Search for a movie/series.
     * @param {object} options The options based on which the search will be conducted.
     * @example
     * search({query: 'Saw', year: 2004, format: 'xml', type: 'movie'})
     * @returns {Promise}
     * @fulfil {object} - The movie/series object.
     * @reject {Error} - The error with an appropriate `message`.
     */

  }, {
    key: 'search',
    value: function search(options) {
      if (!options.query) {
        throw new Error('Query must be given');
      }

      var reqOptions = this._translateIncomingRequestOptions(options);
      reqOptions.plot = reqOptions.plot || 'full';
      reqOptions.format = reqOptions.format || 'json';
      return this._makeHTTPGET('', reqOptions, null, this._transformResponse.bind(this)).then(function (resp) {
        return resp.data;
      });
    }

    /**
     * Get a media(movie/series) by title and year
     * @param {string} title Title of the media (movie/series)
     * @param {number} year The year media type(movie/series) was released (Optional).
     * @param {string} [type='movie'] Type of the media; movie/series (Optional).
     * @returns {Promise}
     * @fulfil {object} - The movie/series object.
     * @reject {Error} - The error with an appropriate `message`.
     */

  }, {
    key: 'getByTitleAndYear',
    value: function getByTitleAndYear(title, year) {
      var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'movie';

      return this.get({ title: title, year: year, format: 'json', plot: 'short', type: type });
    }

    /**
     * Get a media(movie/series) by IMDB ID
     * @param {string} imdbID IMDB ID of the media
     * @returns {Promise}
     * @fulfil {object} - The movie/series object.
     * @reject {Error} - The error with an appropriate `message`.
     */

  }, {
    key: 'getByIMDBId',
    value: function getByIMDBId(imdbID) {
      return this.get({ imdbID: imdbID, format: 'json', plot: 'short' });
    }
  }, {
    key: '_transformResponse',
    value: function _transformResponse(data) {
      var _this2 = this;

      if (data['Search']) {
        return data['Search'].map(function (result) {
          return _this2._translateResponseObject(result);
        });
      } else {
        return this._translateResponseObject(data);
      }
    }
  }, {
    key: '_translateResponseObject',
    value: function _translateResponseObject(responseObj) {
      var translated = {};
      Object.keys(responseObj).forEach(function (key) {
        translated[utils.toCamelCase(key)] = responseObj[key];
      });
      return translated;
    }
  }, {
    key: 'authParam',
    get: function get() {
      return 'apikey';
    }
  }, {
    key: 'requestKeyMap',
    get: function get() {
      return {
        title: 't',
        query: 's',
        year: 'y',
        imdbID: 'i',
        plot: 'plot',
        format: 'r',
        type: 'type',
        page: 'page'
      };
    }
  }], [{
    key: 'getInstance',
    value: function getInstance(apiKey) {
      return new OMDBAPIClient(apiKey, 'http://www.omdbapi.com/');
    }
  }]);

  return OMDBAPIClient;
}(BaseClient);

module.exports = OMDBAPIClient;