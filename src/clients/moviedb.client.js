let axios = require('axios');
let BaseClient = require('./base.client');

class MovieDBClient extends BaseClient{
  static getInstance(apiKey) {
    return new MovieDBClient(apiKey, 'https://api.themoviedb.org/3/');
  }

  get authParam() {
    return 'api_key';
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
    if (!options.imdbID) {
      if (!options.title || !options.year || !options.type) {
        throw new Error('Either one of the format of data must be provided: imdbID | (title, year, type)');
      }
    }

    let url, responseTransformer, reqOptions = {};

    if (options.imdbID) {
      url = this._getURL('imdbID') + '/' + options.imdbID;
      reqOptions['external_source'] = 'imdb_id';
      responseTransformer = (data) => {
        let nonEmptyResultsKey = Object.keys(data).filter((k) => {
          return data[k].length > 0;
        });

        if (nonEmptyResultsKey.length > 0) {
          return data[nonEmptyResultsKey[0]];
        } else {
          return [];
        }
      };
    } else {
      options.type = options.type || 'movie';
      reqOptions = this._translateIncomingRequestOptions(options);
      reqOptions['include_adult'] = false;
      reqOptions['page'] = 1;
      url = this._getURL(options.type);

      if (options.type === 'series') {
        reqOptions['first_air_date_year'] = options.year;
        delete reqOptions['primary_release_year'];
      }
      let mediaType = options.type === 'series' ? 'tv' : 'movie';

      responseTransformer = (data) => {
        return this._findMatchByTitleAndYear(
          data.results,
          options.title,
          options.year,
          mediaType,
          true
        );
      };
    }

    return this._makeHTTPGET(
      url,
      reqOptions,
      null,
      responseTransformer
    ).then((resp) => {
      if (resp.data.length) {
        // fetch the details
        return this.getDetails(resp.data[0].id, this._guessMediaType(resp.data[0]));
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
    if (!options.query) {
      throw new Error('Query must be given');
    }
    options.type = options.type || 'movie';
    let reqOptions = this._translateIncomingRequestOptions(options);
    reqOptions['include_adult'] = false;
    let url = this._getURL('search');

    let responseTransformer = (data) => {
      return {
        currentPage: options.page,
        totalPages: data['total_pages'],
        numFound: data['total_results'],
        results: data.results.map((result) => {
          return this._translateResponseObject(result, result['media_type'])
        })
      };
    };

    return this._makeHTTPGET(
      url,
      reqOptions,
      null,
      responseTransformer
    ).then((resp) => {
      return resp.data;
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

  _findMatchByTitleAndYear(movieResults, qTitle, qYear, mediaType, exact=false) {
    return movieResults.filter((movieResult) => {
      let titleKey = mediaType === 'tv' ? 'name' : 'title';
      let dateKey = mediaType === 'tv' ? 'first_air_date' : 'release_date';
      let title = movieResult[titleKey];
      let year = movieResult[dateKey].match(/(\d{4})-\d{2}-\d{2}/)[1];
      let normalizedTitle = title.toLowerCase().replace(/_|-|\.|:/, ' ');
      let normalizedQueryTitle = qTitle.toLowerCase();
      return exact ? (normalizedQueryTitle === normalizedTitle && year === qYear)
        : (normalizedTitle.includes(normalizedQueryTitle) || (qYear && year == qYear));
    });
  }

  _guessMediaType(response) {
    return response.name ? 'series' : (response.title ? 'movie' : '');
  }

  _translateResponseObject(responseObj, mediaType) {
    let response = {};
    let titleKey = mediaType === 'tv' ? 'name' : 'title';
    let dateKey = mediaType === 'tv' ? 'first_air_date' : 'release_date';

    response['id'] = responseObj['id'];
    response['imdbID'] = responseObj['imdb_id'];
    response['title'] = responseObj[titleKey];
    response['year'] = responseObj[dateKey].match(/(\d{4})-\d{2}-\d{2}/)[1];
    response['summary'] = responseObj['overview'];
    response['poster'] = 'http://image.tmdb.org/t/p/original' + responseObj['poster_path'];
    response['genres'] = responseObj['genres'] || responseObj['genre_ids'];
    response['rating'] = responseObj['vote_average'];
    return response;
  }
}

module.exports = MovieDBClient;
