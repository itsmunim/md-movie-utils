### md-movie-utils

All the movie info extraction utilities in one place. Has built-in,
easy to use OMDB and TMDB clients and more.

#### Setup

`npm install md-movie-utils --save`

#### How to use

##### Using Open Movie Database/The Movie Database clients
- Initialize the client using your API key-
    
    ```
    let movieDBClients = require('md-movie-utils').clients;
    let omdbClient = movieDBClients.OMDBClient.getInstance(<YOUR_API_KEY>);
    ```
 
- Get info on any movie using the simple get methods-
    
    ```
    let movieRequest = {
        title: 'Thor Ragnarok',
        year: 2017,
        format: 'json',
        plot: 'full',
        type: 'movie'
    };
    omdbClient.get(movieRequest)
        .then((data) => {
            console.log(data); // Thor Ragnarok movie info is here!
        });
        
        
    // or using the IMDB ID
    
    let movieRequest = {
        imdbID: 'tt2345',
        format: 'json',
        plot: 'full',
        type: 'movie'
    };
    omdbClient.get(movieRequest)
        .then((data) => {
            console.log(data); // Movie info is here!
        });
    ```
    
- Or even simply using the helper methods-
    ```
    omdbClient.getByTitleAndYear(title, year)
        .then((data) => {
            console.log(data); // Movie info is here!
        });
        
        
    // or using the IMDB ID
    omdbClient.getByIMDBId(imdbID)
        .then((data) => {
            console.log(data); // Movie info is here!
        });
    ```
    
- You can also search for a movie/series-
    
    ```
    let searchRequest = {
        query: 'Saw'
    };
    omdbClient.search(searchRequest)
        .then((data) => {
            console.log(data); // Movie info(s) is here!
        });
    ```
    
#### Examples

Examples are located in `example/server.js`

First, replace api keys with yours in `example/server.js`

Then run examples- `yarn examples`

Example API-

`localhost:3000`
- `/omdb/get?title=Saw&year=2004&type=movie`
- `/omdb/movie/getByTitleAndYear?title=Saw&year=2004`
- `/omdb/series/getByTitleAndYear?title=Saw&year=2004`
- `/omdb/search?q=Batman`
- `/tmdb/get?title=Saw&year=2004&type=movie`
- `/tmdb/movie/getByTitleAndYear?title=Saw&year=2004`
- `/tmdb/series/getByTitleAndYear?title=Saw&year=2004`
- `/tmdb/get/:imdbID`
- `/tmdb/search?q=The Dark Knight`
      
      
#### The MIT License

Copyright 2018 Munim Dibosh

Permission is hereby granted, free of charge, to any person obtaining a copy of this 
software and associated documentation files (the "Software"), to deal in the Software 
without restriction, including without limitation the rights to use, copy, modify, 
merge, publish, distribute, sublicense, and/or sell copies of the Software, and to 
permit persons to whom the Software is furnished to do so, subject to the following 
conditions:

The above copyright notice and this permission notice shall be included in all copies 
or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE 
OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
      
        
    
    
