let axios = require('axios');

class BaseClient {
  constructor(apiKey, baseUrl) {
    if (!apiKey) {
      throw new Error('API Key not provided.');
    }

    this._apiKey = apiKey;

    this._httpManager = axios.create({
      baseURL: baseUrl,
      timeout: 5000
    });
  }

  get authParam() {
    throw new Error('Not implemented');
  }

  get httpManager() {
    return this._httpManager;
  }

  get requestKeyMap () {
    throw new Error('Not implemented');
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
   */
  get(options) {
    throw new Error('Not implemented');
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
   */
  search(options) {
    throw new Error('Not implemented');
  }

  /**
   * Get a movie by title and/or year
   * @param title Title of the movie
   * @param year Optional
   * @param type Optional. Default- movie
   */
  getByTitleAndYear(title, year, type = 'movie') {
    throw new Error('Not implemented');
  }

  /**
   * Get a movie by IMDB ID
   * @param imdbID
   */
  getByIMDBId(imdbID) {
    throw new Error('Not implemented');
  }

  _makeHTTPGET(url, params, headers, responseTransformer) {
    return this.httpManager({
      method: 'get',
      url: url,
      params: params,
      headers: headers,
      transformResponse: [responseTransformer]
    });
  }

  _translateIncomingRequestOptions(options) {
    let translated = {};
    Object.keys(options).forEach((key) => {
      if (options[key]) {
        translated[this.requestKeyMap[key]] = options[key];
      }
    });
    return translated;
  }
}

module.exports = BaseClient;
