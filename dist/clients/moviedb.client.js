'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var axios = require('axios');
var BaseClient = require('./base.client');

var MovieDBClient = function (_BaseClient) {
  _inherits(MovieDBClient, _BaseClient);

  function MovieDBClient() {
    _classCallCheck(this, MovieDBClient);

    return _possibleConstructorReturn(this, (MovieDBClient.__proto__ || Object.getPrototypeOf(MovieDBClient)).apply(this, arguments));
  }

  _createClass(MovieDBClient, [{
    key: 'get',


    /**
     * Get a media(movie/series) by looking up using different params (e.g. title, imdb id, year etc.)
     * @param {object} options The options based on which the movie will be fetched.
     * @example
     * get({title: 'Saw', year: 2004, type: 'movie'})
     * @example
     * get({imdbID: 'tt12444'})
     * @returns {Promise}
     * @fulfil {object} - The movie/series object.
     * @reject {Error} - The error with an appropriate `message`.
     */
    value: function get(options) {
      var _this2 = this;

      if (!options.imdbID) {
        if (!options.title || !options.year || !options.type) {
          throw new Error('Either one of the format of data must be provided: imdbID | (title, year, type)');
        }
      }

      var url = void 0,
          responseTransformer = void 0,
          reqOptions = {};

      if (options.imdbID) {
        url = this._getURL('imdbID') + '/' + options.imdbID;
        reqOptions['external_source'] = 'imdb_id';
        responseTransformer = function responseTransformer(data) {
          var nonEmptyResultsKey = Object.keys(data).filter(function (k) {
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
        var mediaType = options.type === 'series' ? 'tv' : 'movie';

        responseTransformer = function responseTransformer(data) {
          return _this2._findMatchByTitleAndYear(data.results, options.title, options.year, mediaType, true);
        };
      }

      return this._makeHTTPGET(url, reqOptions, null, responseTransformer).then(function (resp) {
        if (resp.data.length) {
          // fetch the details
          return _this2.getDetails(resp.data[0].id, _this2._guessMediaType(resp.data[0]));
        } else {
          return {};
        }
      });
    }

    /**
     * Search for a movie/series.
     * @param {object} options The options based on which the search will be conducted.
     * @example
     * search({query: 'Saw', year: 2004, type: 'movie'})
     * @returns {Promise}
     * @fulfil {object} - The movie/series object.
     * @reject {Error} - The error with an appropriate `message`.
     */

  }, {
    key: 'search',
    value: function search(options) {
      var _this3 = this;

      if (!options.query) {
        throw new Error('Query must be given');
      }
      options.type = options.type || 'movie';
      var reqOptions = this._translateIncomingRequestOptions(options);
      reqOptions['include_adult'] = false;
      var url = this._getURL('search');

      var responseTransformer = function responseTransformer(data) {
        return {
          currentPage: options.page,
          totalPages: data['total_pages'],
          numFound: data['total_results'],
          results: data.results.map(function (result) {
            return _this3._translateResponseObject(result, result['media_type']);
          })
        };
      };

      return this._makeHTTPGET(url, reqOptions, null, responseTransformer).then(function (resp) {
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

      return this.get({ title: title, year: year, type: type });
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
      return this.get({ imdbID: imdbID });
    }

    /**
     * Get details of a movie or series with given tmdb id
     * @param {string} tmdbID The Movie DB ID of the media
     * @param {string} type The media type; movie/series
     * @returns {Promise}
     * @fulfil {object} - The movie/series object.
     * @reject {Error} - The error with an appropriate `message`.
     */

  }, {
    key: 'getDetails',
    value: function getDetails(tmdbID, type) {
      var _this4 = this;

      var mediaType = type === 'series' ? 'tv' : 'movie';
      var detailsUrl = this._getURL(type + 'Details') + '/' + tmdbID;
      return this._makeHTTPGET(detailsUrl, null, null, null).then(function (resp) {
        return _this4._translateResponseObject(resp.data, mediaType);
      });
    }
  }, {
    key: '_getURL',
    value: function _getURL(identifier) {
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
  }, {
    key: '_findMatchByTitleAndYear',
    value: function _findMatchByTitleAndYear(movieResults, qTitle, qYear, mediaType) {
      var exact = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

      return movieResults.filter(function (movieResult) {
        var titleKey = mediaType === 'tv' ? 'name' : 'title';
        var dateKey = mediaType === 'tv' ? 'first_air_date' : 'release_date';
        var title = movieResult[titleKey];
        var year = movieResult[dateKey].match(/(\d{4})-\d{2}-\d{2}/)[1];
        var normalizedTitle = title.toLowerCase().replace(/_|-|\.|:/, ' ');
        var normalizedQueryTitle = qTitle.toLowerCase();
        return exact ? normalizedQueryTitle === normalizedTitle && year === qYear : normalizedTitle.includes(normalizedQueryTitle) || qYear && year == qYear;
      });
    }
  }, {
    key: '_guessMediaType',
    value: function _guessMediaType(response) {
      return response.name ? 'series' : response.title ? 'movie' : '';
    }
  }, {
    key: '_translateResponseObject',
    value: function _translateResponseObject(responseObj, mediaType) {
      var response = {};
      var titleKey = mediaType === 'tv' ? 'name' : 'title';
      var dateKey = mediaType === 'tv' ? 'first_air_date' : 'release_date';

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
  }, {
    key: 'authParam',
    get: function get() {
      return 'api_key';
    }
  }, {
    key: 'requestKeyMap',
    get: function get() {
      return {
        title: 'query',
        query: 'query',
        page: 'page',
        year: 'primary_release_year'
      };
    }
  }], [{
    key: 'getInstance',
    value: function getInstance(apiKey) {
      return new MovieDBClient(apiKey, 'https://api.themoviedb.org/3/');
    }
  }]);

  return MovieDBClient;
}(BaseClient);

module.exports = MovieDBClient;