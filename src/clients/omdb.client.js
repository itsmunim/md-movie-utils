let axios = require('axios');
let utils = require('../utils');
let BaseClient = require('./base.client');

class OMDBAPIClient extends BaseClient{
  static getInstance(apiKey) {
    return new OMDBAPIClient(apiKey, 'http://www.omdbapi.com/');
  }

  get authParam() {
    return '?apikey=' + this._apiKey;
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
   * Get a movie by looking up using different params (e.g. title, imdb id, year etc.)
   * @param options
   * Example- {
   *  title: 'Saw',
   *  year: 2004,
   *  plot: 'full|short',
   *  format: 'json|xml',
   *  type: 'movie|series',
   *  imdbID: tt12444
   * }
   * @returns {*|Promise.<TResult>}
   */
  get(options) {
    let reqOptions = this._translateIncomingRequestOptions(options);
    return this._makeHTTPGET(this.authParam, reqOptions, null, this._transformResponse)
      .then((resp) => {
        return resp.data;
      });
  }

  /**
   * Search for a movie.
   * @param options
   * Example- {
   *  query: 'Saw',
   *  year: 2004,
   *  format: 'json|xml',
   *  type: 'movie|series|episode'
   * }
   * @returns {*|Promise.<TResult>}
   */
  search(options) {
    let reqOptions = this._translateIncomingRequestOptions(options);
    return this._makeHTTPGET(this.authParam, reqOptions, null, this._transformResponse)
      .then((resp) => {
        return resp.data;
      });
  }

  /**
   * Get a movie by title and/or year
   * @param title Title of the movie
   * @param year Optional
   * @param type Optional. Default- movie
   * @returns {*|Promise.<TResult>}
   */
  getByTitleAndYear(title, year, type = 'movie') {
    return this.get({title: title, year: year, format: 'json', plot: 'short', type: type});
  }

  /**
   * Get a movie by IMDB ID
   * @param imdbID
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
