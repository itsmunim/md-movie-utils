let axios = require('axios');
let BaseClient = require('base.client');

class MovieDBClient extends BaseClient{
  static getInstance(apiKey) {
    return new MovieDBClient(apiKey, 'https://api.themoviedb.org/3/');
  }

  get authParam() {
    return '?api_key=' + this._apiKey;
  }

  get requestKeyMap() {
    return {
      title: 'query',
      query: 'query',
      page: 'page',
      year: 'primary_release_year'
    };
  }

  /**
   * Get a movie by looking up using different params (e.g. title, imdb id, year etc.)
   * @param options
   * Example- {
   *  title: 'Saw',
   *  year: 2004,
   *  type: 'movie|series',
   *  imdbID: tt12444
   * }
   * @returns {*|Promise.<TResult>}
   */
  get(options) {
    let url, reqOptions = {};

    options.type = options.type || 'movie';
    if (options.imdbID) {
      url = this._getURL('imdbID') + '/' + options.imdbID;
      reqOptions['external_source'] = 'imdb_id';
    } else {
      reqOptions = this._translateIncomingRequestOptions(options);
      reqOptions['include_adult'] = false;
      reqOptions['page'] = 1;
      url = this._getURL(options.type);

      if (options.type === 'series') {
        reqOptions['first_air_date_year'] = options.year;
        delete reqOptions['primary_release_year'];
      }
    }

    url = url + this.authParam;
    let mediaType = options.type === 'series' ? 'tv' : 'movie';

    return this._makeHTTPGET(
      url,
      reqOptions,
      null,
      this._flattenResponse(mediaType, options.title, options.year, true)
    ).then((resp) => {
      if (resp.data.length) {
        // fetch the details
        return this.getDetails(resp.data[0].id, options.type);
      } else {
        return {};
      }
    });
  }

  /**
   * Search.
   * @param options
   * Example- {
   *  query: 'Saw',
   *  page: 1,
   *  type: 'movie|series'
   * }
   */
  search(options) {
    options.type = options.type || 'movie';
    let reqOptions = this._translateIncomingRequestOptions(options);
    reqOptions['include_adult'] = false;
    let url = this._getURL('search') + this.authParam;
    let mediaTypeMatcher = options.type === 'series' ? 'name' : 'title';

    return this._makeHTTPGET(
      url,
      reqOptions,
      null,
      this._flattenResponse(mediaType, options.query, null)
    ).then((resp) => {
      return resp.data.filter((result) => {
        return !result[mediaTypeMatcher];
      });
    });
  }

  /**
   * Get a media that match exact title & given year
   * @param title
   * @param year
   * @param type 'movie|series'
   * @returns {*|Promise.<TResult>}
     */
  getByTitleAndYear(title, year, type = 'movie') {
    return this.get({title: title, year: year, type: type});
  }

  /**
   * Get a media matched by the given imdb id
   * @param imdbID
   * @returns {*|Promise.<TResult>}
     */
  getByIMDBId(imdbID) {
    return this.get({imdbID: imdbID});
  }

  /**
   * Get details of a movie or series with given tmdb id
   * @param tmdbID The Movie DB ID of the media
   * @param type 'movie|series'
   * @returns {*|Promise.<TResult>}
     */
  getDetails(tmdbID, type) {
    let mediaType = type === 'series' ? 'tv' : 'movie';
    let detailsUrl = this._getURL(type + 'Details') + '/' + tmdbID;
    detailsUrl = detailsUrl + this.authParam;
    return this._makeHTTPGET(detailsUrl, null, null, null)
      .then((resp) => {
        return this._translateResponseObject(resp.data, mediaType);
      });
  }

  _getURL(identifier) {
    return {
      movie: 'search/movie',
      series: 'search/tv',
      search: 'search/multi',
      movieDetails: 'movie',
      seriesDetails: 'tv',
      genreList: 'genre/movie/list',
      imdbID: 'find'
    }[identifier];
  }

  _flattenResponse(mediaType, queryTitle, queryYear, checkForExactMatch=false) {
    return (data) => {
      let idBasedResults = data[mediaType + '_results'];
      return idBasedResults ||
              this._findMatchByTitleAndYear(data.results, queryTitle, queryYear, mediaType, checkForExactMatch);
    }
  }

  _findMatchByTitleAndYear(movieResults, qTitle, qYear, mediaType, exact=false) {
    return movieResults.filter((movieResult) => {
      let titleKey = mediaType === 'tv' ? 'name' : 'title';
      let dateKey = mediaType === 'tv' ? 'first_air_date' : 'release_date';
      let title = movieResult[titleKey];
      let year = movieResult[dateKey].match(/(\d{4})-\d{2}-\d{2}/)[1];
      let normalizedTitle = title.toLowerCase();
      let normalizedQueryTitle = qTitle.toLowerCase();
      return exact ? (normalizedQueryTitle === normalizedTitle && year === qYear)
        : (normalizedTitle.includes(normalizedQueryTitle) || (qYear && year == qYear));
    });
  }

  _translateResponseObject(responseObj, mediaType) {
    let response = {};
    let titleKey = mediaType === 'tv' ? 'name' : 'title';
    let dateKey = mediaType === 'tv' ? 'first_air_date' : 'release_date';

    response['id'] = responseObj['id'];
    response['title'] = responseObj[titleKey];
    response['year'] = responseObj[dateKey].match(/(\d{4})-\d{2}-\d{2}/)[1];
    response['summary'] = responseObj['overview'];
    response['poster'] = 'http://image.tmdb.org/t/p/original' + responseObj['poster_path'];
    response['genres'] = responseObj['genres'];
    response['rating'] = responseObj['vote_average'];
    return response;
  }
}

module.exports = MovieDBClient;
