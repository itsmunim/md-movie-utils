let axios = require('axios');

class OMDBAPIClient {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('API Key not provided.');
    }

    this._omdbRequestKeyMap = {
      title: 't',
      query: 's',
      year: 'y',
      imdbID: 'i',
      plot: 'plot',
      format: 'r',
      type: 'type',
      page: 'page'
    };

    this._httpManager = axios.create({
      baseURL: 'http://www.omdbapi.com/?apikey=' + apiKey,
      timeout: 5000
    });
  }

  /**
   * Get a movie by looking up using different params (e.g. title, imdb id, year etc.)
   * @param options
   * Example- {
   *  title: 'Saw',
   *  year: 2004,
   *  plot: 'full|short',
   *  format: 'json|xml',
   *  type: 'movie|series|episode',
   *  imdbID: tt12444
   * }
   */
  get(options) {
    let reqOptions = this._translateIncomingRequestOptions(options);
    return this._makeHTTPGET(null, reqOptions, null, this._transformResponse)
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
   */
  search(options) {
    let reqOptions = this._translateIncomingRequestOptions(options);
    return this._makeHTTPGET(null, reqOptions, null, this._transformResponse)
      .then((resp) => {
        return resp.data;
      });
  }

  /**
   * Get a movie by title and/or year
   * @param title Title of the movie
   * @param year Optional
   * @param type Optional. Default- movie
   */
  getByTitleAndYear(title, year, type = 'movie') {
    return this.get({title: title, year: year, format: 'json', plot: 'short', type: type});
  }

  /**
   * Get a movie by IMDB ID
   * @param imdbID
   */
  getByIMDBId(imdbID) {
    return this.get({imdbID: imdbID, format: 'json', plot: 'short'});
  }

  /**
   * Makes a GET HTTP call
   * @param url
   * @param params
   * @param headers
   * @param responseTransformer A function of format `function (data) { //transform the data and return }`
   * @returns A wrapped request promise
   */
  _makeHTTPGET(url, params, headers, responseTransformer) {
    return this._httpManager({
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
        translated[this._omdbRequestKeyMap[key]] = options[key];
      }
    });
    return translated;
  }

  _transformResponse(data) {
    let transformed = {};
    Object.keys(data).forEach((key) => {
      transformed[toCamelCase(key)] = data[key];
    });
    return transformed;
  }
}

/**
 * Ref- https://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
 * @param str A string. Example formats- big Bang, Big Bang, BigBang, big-bang, big_bang etc.
 * @returns camelCase form of str(e.g. bigBang)
 */
const toCamelCase = (str) => {
  return str.replace(/^([A-Z])|[\s-_](\w)/g, function (match, p1, p2) {
    if (p2) return p2.toUpperCase();
    return p1.toLowerCase();
  });
};


const getClient = (apiKey) => {
  return new OMDBAPIClient(apiKey);
};


module.exports = {getClient};
