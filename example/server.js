var express = require("express");
var bodyParser = require("body-parser");
var movieDBClients = require('../dist').clients;
var app = express();

var omdbClient = movieDBClients.OMDBClient.getInstance('omdb_api_key');
var tmdbClient = movieDBClients.MovieDBClient.getInstance('tmdb_api_key');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var response = {
  success: function (res) {
    return function (movie) {
      if (movie) {
        return res.status(200).json(movie);
      } else {
        return res.status(404);
      }
    };
  },
  failure: function (res) {
    return function (err) {
      return res.status(500).json({message: err.message});
    }
  }
};

// omdb
app.get("/omdb/get", function (req, res) {
  omdbClient.get({
    title: req.query.title,
    year: req.query.year,
    type: req.query.type
  }).then(response.success(res), response.failure(res));
});

app.get("/omdb/movie/getByTitleAndYear", function (req, res) {
  omdbClient.getByTitleAndYear(req.query.title, req.query.year)
    .then(response.success(res), response.failure(res));
});

app.get("/omdb/series/getByTitleAndYear", function (req, res) {
  omdbClient.getByTitleAndYear(req.query.title, req.query.year, 'series')
    .then(response.success(res), response.failure(res));
});

app.get("/omdb/get/:imdbID", function (req, res) {
  omdbClient.getByIMDBId(req.params.imdbID)
    .then(response.success(res), response.failure(res));
});

app.get("/omdb/search", function (req, res) {
  omdbClient.search({query: req.query.q, year: req.query.year, type: req.query.type})
    .then(response.success(res), response.failure(res));
});

// tmdb
app.get("/tmdb/get", function (req, res) {
  tmdbClient.get({
    title: req.query.title,
    year: req.query.year,
    type: req.query.type
  }).then(response.success(res), response.failure(res));
});

app.get("/tmdb/movie/getByTitleAndYear", function (req, res) {
  tmdbClient.getByTitleAndYear(req.query.title, req.query.year)
    .then(response.success(res), response.failure(res));
});

app.get("/tmdb/series/getByTitleAndYear", function (req, res) {
  tmdbClient.getByTitleAndYear(req.query.title, req.query.year, 'series')
    .then(response.success(res), response.failure(res));
});

app.get("/tmdb/get/:imdbID", function (req, res) {
  tmdbClient.getByIMDBId(req.params.imdbID)
    .then(response.success(res), response.failure(res));
});

app.get("/tmdb/search", function (req, res) {
  tmdbClient.search({query: req.query.q, year: req.query.year, type: req.query.type})
    .then(response.success(res), response.failure(res));
});


app.listen(3000, function () {
  console.log("app running on port.", 3000);
});
