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
   * @returns {*|Promise.<TResult>}
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

    return this._makeHTTPGET('', reqOptions, null, this._transformResponse)
      .then((resp) => {
        return resp.data;
      });
  }

  /**
   * Search for a movie/series.
   * @param {object} options The options based on which the search will be conducted.
   * @example
   * search({query: 'Saw', year: 2004, format: 'xml', type: 'movie'})
   * @returns {*|Promise.<TResult>}
   */
  search(options) {
    let reqOptions = this._translateIncomingRequestOptions(options);
    return this._makeHTTPGET('', reqOptions, null, this._transformResponse)
      .then((resp) => {
        return resp.data;
      });
  }

  /**
   * Get a media(movie/series) by title and/or year
   * @param {string} title Title of the media (movie/series)
   * @param {number} year The year media type(movie/series) was released (Optional).
   * @param {string} [type='movie'] Type of the media; movie/series (Optional).
   * @returns {*|Promise.<TResult>}
   */
  getByTitleAndYear(title, year, type = 'movie') {
    return this.get({title: title, year: year, format: 'json', plot: 'short', type: type});
  }

  /**
   * Get a media(movie/series) by IMDB ID
   * @param {string} imdbID IMDB ID of the media
   * @returns {*|Promise.<TResult>}
   */
  getByIMDBId(imdbID) {
    return this.get({imdbID: imdbID, format: 'json', plot: 'short'});
  }

  _transformResponse(data) {
    let transformed = {};
    Object.keys(data).forEach((key) => {
      transformed[utils.toCamelCase(key)] = data[key];
    });
    return transformed;
  }
}

module.exports = OMDBAPIClient;
