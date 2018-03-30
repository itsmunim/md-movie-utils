let axios = require('axios');
let utils = require('../utils');
let BaseClient = require('./base.client');

class OMDBAPIClient extends BaseClient {
  static getInstance(apiKey) {
    return new OMDBAPIClient(apiKey, 'http://www.omdbapi.com/');
  }

  get authParam() {
    return 'apikey';
  }

  get requestKeyMap() {
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
  get(options) {
    if (!options.imdbID) {
      if (!options.title || !options.year || !options.type) {
        throw new Error('Either one of the format of data must be provided: imdbID | (title, year, type)');
      }
    }

    let reqOptions = this._translateIncomingRequestOptions(options);
    reqOptions.plot = reqOptions.plot || 'full';
    reqOptions.format = reqOptions.format || 'json';

    return this._makeHTTPGET('', reqOptions, null, this._transformResponse.bind(this))
      .then((resp) => {
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
  search(options) {
    if (!options.query) {
      throw new Error('Query must be given');
    }

    let reqOptions = this._translateIncomingRequestOptions(options);
    reqOptions.plot = reqOptions.plot || 'full';
    reqOptions.format = reqOptions.format || 'json';
    return this._makeHTTPGET('', reqOptions, null, this._transformResponse.bind(this))
      .then((resp) => {
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
  getByTitleAndYear(title, year, type = 'movie') {
    return this.get({title: title, year: year, format: 'json', plot: 'short', type: type});
  }

  /**
   * Get a media(movie/series) by IMDB ID
   * @param {string} imdbID IMDB ID of the media
   * @returns {Promise}
   * @fulfil {object} - The movie/series object.
   * @reject {Error} - The error with an appropriate `message`.
   */
  getByIMDBId(imdbID) {
    return this.get({imdbID: imdbID, format: 'json', plot: 'short'});
  }

  _transformResponse(data) {
    if (data['Search']) {
      return data['Search'].map((result) => {
        return this._translateResponseObject(result);
      });
    } else {
      return this._translateResponseObject(data);
    }
  }

  _translateResponseObject(responseObj) {
    let translated = {};
    Object.keys(responseObj).forEach((key) => {
      translated[utils.toCamelCase(key)] = responseObj[key];
    });
    return translated;
  }
}

module.exports = OMDBAPIClient;
