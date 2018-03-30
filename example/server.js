var express = require("express");
var bodyParser = require("body-parser");
var movieDBClients = require('../src').clients;
var app = express();

var omdbClient = movieDBClients.OMDBClient.getInstance('your_api_key');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// omdb
var omdbResponse = {
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

app.get("/omdb/get", function (req, res) {
  omdbClient.get({
    title: req.query.title,
    year: req.query.year,
    type: req.query.type
  }).then(omdbResponse.success(res), omdbResponse.failure(res));
});

app.get("/omdb/movie/getByTitleAndYear", function (req, res) {
  omdbClient.getByTitleAndYear(req.query.title, req.query.year)
    .then(omdbResponse.success(res), omdbResponse.failure(res));
});

app.get("/omdb/series/getByTitleAndYear", function (req, res) {
  omdbClient.getByTitleAndYear(req.query.title, req.query.year, 'series')
    .then(omdbResponse.success(res), omdbResponse.failure(res));
});

app.get("/omdb/get/:imdbID", function (req, res) {
  omdbClient.getByIMDBId(req.params.imdbID)
    .then(omdbResponse.success(res), omdbResponse.failure(res));
});

app.listen(3000, function () {
  console.log("app running on port.", 3000);
});
