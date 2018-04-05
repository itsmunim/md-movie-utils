'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _parseTorrentName = require('parse-torrent-name');

var _parseTorrentName2 = _interopRequireDefault(_parseTorrentName);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Parser = function () {
  /**
   * @constructor
   */
  function Parser() {
    _classCallCheck(this, Parser);

    this.formats = {
      SPACE_FORMAT: /(.+)\s(\d{4})/,
      BRACES_FORMAT: /(.+)\s?\((\d{4})\)/,
      DOT_FORMAT: /([^.]+)\.(\d{4})/
    };
  }

  /**
   * Get movie name, year, resolution, quality and different info from a torrent file name.
   * Powered by parse-torrent-name module.
   * @param {string} movieFileName Movie file torrent name
   * @returns {object} The movie info
   */


  _createClass(Parser, [{
    key: 'parseFromTorrentFileName',
    value: function parseFromTorrentFileName(movieFileName) {
      movieFileName = movieFileName.replace(/\.(mp4|mkv|avi|wmv|flv)/, '');
      var rawInfo = (0, _parseTorrentName2.default)(movieFileName);
      if (!rawInfo.title || !rawInfo.year) {
        throw new Error('Movie info parsing failed');
      }

      return rawInfo;
    }

    /**
     * Get a movie name & year from its filename that complies to certain format
     * @param {string} movieFileName
     * @param format Any of the format value from `parser.formats`
     * @example
     * parser.parse('Batman Begins (2005)', parser.formats.BRACES_FORMAT)
     * @returns {object} An object with movie name & year
     */

  }, {
    key: 'parseMovieNameAndYear',
    value: function parseMovieNameAndYear(movieFileName, format) {
      var match = movieFileName.match(format);
      if (match) {
        return {
          title: match[1].trim(),
          year: match[2].trim()
        };
      } else {
        throw new Error('Movie info parsing failed');
      }
    }
  }]);

  return Parser;
}();

module.exports = Parser;