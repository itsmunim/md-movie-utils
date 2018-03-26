let axios = require('axios');
let utils = require('../utils');
let BaseClient = require('base.client');

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

  get(options) {
    let reqOptions = this._translateIncomingRequestOptions(options);
    return this._makeHTTPGET(this.authParam, reqOptions, null, this._transformResponse)
      .then((resp) => {
        return resp.data;
      });
  }

  search(options) {
    let reqOptions = this._translateIncomingRequestOptions(options);
    return this._makeHTTPGET(this.authParam, reqOptions, null, this._transformResponse)
      .then((resp) => {
        return resp.data;
      });
  }

  getByTitleAndYear(title, year, type = 'movie') {
    return this.get({title: title, year: year, format: 'json', plot: 'short', type: type});
  }

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

module.exports = {getClient: OMDBAPIClient.getInstance};
