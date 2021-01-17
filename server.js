// Requires
const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const { allowedNodeEnvironmentFlags } = require('process');

// Objects and Data
let movies = require(path.join(__dirname + "/data/movie-data.json"));
let people = require(path.join(__dirname + "/data/people-data.json"));
let users = require(path.join(__dirname + "/data/user-data.json"));
let reviews = require(path.join(__dirname + "/data/review-data.json"));

let app = express();

// Use the session middleware. creating sessions for users.
app.use(session({secret: "KJKGWEADADGGE"}));

app.use(express.urlencoded({extended: true})); //needed for processing form data.
app.use(express.json());
app.set("view engine", 'pug');

// To serve css and js files across every other file
app.use(express.static('public'));

// The "homepage" to load when no specific url is given. (loads the search screen)
app.get('/', loadSearchMovie);

// GET request for loading all pages.
app.get('/search', loadSearchMovie);
app.get("/movies", loadSearchMovie);
app.get('/movies/:movieId', loadMovie);
app.get('/users', loadSearchUsers);
app.get('/users/:userId', loadUser);
app.get('/people', loadSearchPerson);
app.get('/people/:personId', loadPerson);
app.get('/login', loadLogin);
app.get('/profile', auth, loadProfile);
app.get("/addmovie", loadAddMovies)
app.get("/addperson", loadAddPerson);

// PUT request handlers
app.put("/userType", changeUserType);
app.put("/editMovie", editMovie);

// POST request handlers
app.post("/review", updateReview);
app.post("/movies", addMovie);
app.post("/people", addPeopleReq);
app.post("/follow", follow);
app.post("/unfollow", unfollow);

// Request handlers for sessions
app.get("/", auth, (req, res, next) => {res.redirect("/")});
app.post("/signup", signup);
app.post("/login", login);
app.get("/logout", logout);

/*=================================== Session Request Handlers ===================================*/

// middleware function that checks if a user is logged in or not
function auth(req, res, next) {
  console.log("checking if user is logged in...");
  if(!req.session.loggedin) {
    console.log("user is not logged in");
    res.redirect("/login");
    return;
  }
  next();
}

// handles POST request for /signup
function signup(req, res) {
  let username = req.body.username;
  let password = req.body.password;

  // Check if a user with the request username exists in our system
  let user;
  for(let userId in users){
    if(users[userId].username === username){
      user = users[userId]
    }
  }

  // Check If the user exists
  if(user) {
    // Cannot make new user because user already exists
    res.status(401).send("User already exists.");
    return;
  } else {
    // User does not already exist, we can create a new user
    keys = Object.keys(users);
    lastId = parseInt(keys[keys.length-1]);

    console.log("Last ID in users: " +  lastId);

    // Creating new user object
    user = {};
    user.id = lastId + 1;
    user.username = username;
    user.password = password;
    user.bio = "Welcome to my user page!!! Hope you enjoy your stay!!";
    user.pic = "https://us.123rf.com/450wm/mialima/mialima1603/mialima160300025/55096766-stock-vector-male-user-icon-isolated-on-a-white-background-account-avatar-for-web-user-profile-picture-unknown-ma.jpg?ver=6";
    user.contributing = false;
    user.followers = [];
    user.follows = [];
    user.notifications = [];
    user.reviews = [];
    user.suggested = recommended(movies);

    // Adding user to overall users objects database
    users[lastId + 1] = user;

    // Update the users json to add new user
    // updateUserJSON(users);

    // Set the session logged in to true and give session the username of the user.
    req.session.loggedin = true;
    req.session.username = username;
    console.log("signed up and logged in");
    res.status(200).send("Signed up.");
  }
}

// handles POST request for /login
function login(req, res){
  let username = req.body.username;
  let password = req.body.password;

  let user;

  // Checking if the username sent in request matches something in our database
  for(let userId in users){
    if(users[userId].username === username){
      user = users[userId];
    }
  }
  
  if(user) {
    // Check if the password in the request matches the user's password in our system
    if(user.password == password) {
      //Check if request password matches the user password
      req.session.loggedin = true;
      req.session.username = username;
      res.status(200).send("Logged in");
      console.log("logged in");
    }
  }else{
    res.status(401).send("Not authorized. Invalid username.");
    return;
  }
}

// handles GET request for /logout
function logout(req, res){
  if(req.session.loggedin){
    req.session.loggedin = false;
    console.log("logged out");
    res.status(200).send("logged out");
  } else {
    console.log("user is not logged in");
    res.status(401).send("you are not logged in");
  }
}

/*=================================== Pages and Functionality Request Handlers ===================================*/

// handles GET request for movie search page
function loadSearchMovie(req, res){
  // Search keyword entered by user
  let title = req.query.title;
  let genre = req.query.genre;
  let year = req.query.year;
  let minrating = req.query.minrating;

  console.log("Search title = " + title);

  // Performing search based on title
  if(title == undefined){
    // No title return all movies
    movies_title = filter_movies_title("", movies);
  } else {
    console.log("searching for movies relating to '" + title + "'");
    movies_title = filter_movies_title(title, movies);

    // console.log("Search Results: ");
    // for(let i = 0; i < movies_title.length; i++){
    //   console.log(movies_title[i].title)
    // }
  }

  console.log("Search genre = " + genre);
  // Performing search based on genre
  if(genre == undefined){
    // No genre, return all movies.
    movies_genre = filter_movies_genre("", movies);
  } else {
    console.log("searching for movies related to genre: ", genre);
    movies_genre = filter_movies_genre(genre, movies);

    // console.log("Search Results: ");
    // for(let i = 0; i < movies_genre.length; i++){
    //   console.log(movies_genre[i].title)
    // }
  }

  console.log("Search year = " + year);
  // Performing search based on year
  if(year == undefined){
    // No year query param, return all movies.
    movies_year = filter_movies_title("", movies);
  } else {
    console.log("searching for movies released in : ", year);
    movies_year = filter_movies_year(year, movies);

    // console.log("Search Results: ");
    // for(let i = 0; i < movies_year.length; i++){
    //   console.log(movies_year[i].title)
    // }
  }

  console.log("Search minrating = " + minrating);
  if(minrating == undefined){
    // No minrating query param, return all movies
    movies_rating = filter_movies_rating("0", movies);
  } else {
    console.log("searching for movies with min rating : ", minrating);
    movies_rating = filter_movies_rating(minrating, movies);

    // console.log("Search Results: ");
    // for(let i = 0; i < movies_rating.length; i++){
    //   console.log(movies_rating[i].title)
    // }
  }

  let x = intersection(movies_title, movies_genre);
  let y = intersection(x, movies_year);
  let z = intersection(y, movies_rating);

  let searched_movies = z.slice(0,100); // Only show 100 to not.

  // only contributing users should be allowed to see the add movie button
  let user;
  if(req.session.loggedin){
    user = getUser(req.session.username);
  } else {
    // user is not logged in so they cannot see the 
    user = {"contributing" : false}
  }

  // REST API
  res.format({
    "application/json": function(){
      res.send(searched_movies);
    },
    "text/html": function(){
      res.render("search_movie.pug", {movieList: searched_movies, user: user});
    }
  });
}

// handles GET request for users search page
function loadSearchUsers(req, res){
  // Search title entered by user
  let name = req.query.name;
  console.log("Search name = " + name);

  // Perform searching
  if(name === undefined){
    // no name, return all users
    searched_users = filter_users("", users);
  } else {
    console.log("searching for users relating to '" + name + "'");

    searched_users = filter_users(name, users);

    console.log("Search Results: ");
    for(let i = 0; i < searched_users.length; i++){
      console.log(searched_users[i].username)
    }
  }

  // REST API
  res.format({
    "application/json": function(){
      let send_users = [];

      for(let i = 0; i < searched_users.length; i++){
        user = searched_users[i];
        userObj = {username: user.username};
        send_users.push(userObj);
      }
      res.send(send_users);
    },
    "text/html": function(){
      res.render("search_user.pug", {userList: searched_users});
    }
  });
}

// handles GET request for person search page
function loadSearchPerson(req, res){
  // Search keyword entered by user
  let name = req.query.name;
  console.log("Search name = " + name);

  // Peform searching
  if(name === undefined){
    // no search term, return all people
    searched_people = filter_people("", people);
  } else {
    console.log("searching for people relating to '" + name + "'");

    searched_people = filter_people(name, people);

    // console.log("Search Results: ");
    // for(let i = 0; i < searched_people.length; i++){
    //   console.log(searched_people[i].name)
    // }
  }

  // only contributing users should be allowed to see the add movie button
  let user;
  if(req.session.loggedin){
    user = getUser(req.session.username);
  } else {
    // user is not logged in so they cannot see the 
    user = {"contributing" : false}
  }

  // REST API
  res.format({
    "application/json": function(){
      let send_people = [];

      for(let i = 0; i < searched_people.length; i++){
        let person = searched_people[i];
        personObj = {name: person.name};
        send_people.push(personObj);
      }
      res.send(searched_people);
    },
    "text/html": function(){
      res.render("search_people.pug", {peopleList: searched_people, user: user});
    }
  });
}

// handles GET request for specific movie page
function loadMovie(req, res){
  // Movie that is being requested
  let movie_name = req.params.movieId

  if(movie_name === undefined){
    res.status(404).send("resource is undefined");
    console.log(movie_name);
  }

  console.log("URL Params:" + movie_name);

  let m = getMovie(movie_name)
  let mReviews = [];
  let similar = [];

  if(m === null){
    res.status(404).send("No movie found");
    return;
  }

  for(let id in reviews){
    if(reviews[id].movieId === m.id){
      mReviews.push(reviews[id]);
    }
  }

  for(let i = 0; i < m.similar.length; i++){
    currMovieId = m.similar[i];
    // console.log("movie ID: " + currMovieId);
    // console.log("movie Name: " + movies[currMovieId].title);
    similar.push(getMovie(movies[currMovieId].title));
  }

  // only contributing users should be allowed to see the edit movie button
  let user;
  if(req.session.loggedin){
    user = getUser(req.session.username);
  } else {
    // user is not logged in so they cannot see the 
    user = {"contributing" : false}
  }

  //console.log(mReviews);

  // found a movie matching the request parameters
  console.log("Movie Title: " + m.title);

  res.format({
    "application/json": function(){
      res.send(m);
    },
    "text/html": function(){
      res.render("movie.pug", { movie : m, reviews: mReviews, similar: similar, user: user });
    }
  });
}

// handles GET request for profile page
function loadProfile(req, res){
  let user;

  console.log(req.session.loggedin);

  if(req.session.loggedin){
    user = getUser(req.session.username);
  } 
  //console.log(user);

  let uReviews = [];
  for(let id in reviews){
   if(reviews[id].userId === user.id){
     uReviews.push(reviews[id]);
   }
  }

  let recommended = [];
  for(let i = 0; i < user.suggested.length; i++){
    recommended.push(movies[user.suggested[i]]);
  }

  // console.log("recommended as movie objects: ");
  // console.log(recommended);

  res.format({
    "application/json": function(){
      userObj = {username: user.username, recommended: recommended};
      res.send(userObj);
    },
    "text/html": function(){
      res.render("user.pug", {user: user, recommended: recommended, reviews: uReviews});
    }
  });
}

// handles GET request for user page
function loadUser(req, res){
  let user = req.params.userId;
  let isFollowing = false;

  if(user === undefined){
    res.status(404).send("resource is undefined");
    console.log(user);
    return;
  }

  console.log("URL Params:" + user);

  let u = getUser(user)

  if(u === null){
    res.status(404).send("No user found");
    return;
  }

  if(req.session.loggedin){
    let userSessionID = getUser(req.session.username);
    console.log(userSessionID);
    if(req.session.username === user){
      loadProfile(req, res);
      return;
    } else if(userSessionID != null && doesFollowExist(u.followers, req.session.username, userSessionID.id)){
      console.log("setting isFollowing to true");
      isFollowing = true;
    }
  }

  let uReviews = [];
  for(let id in reviews){
   if(reviews[id].userId === u.id){
     uReviews.push(reviews[id]);
   }
  }

  console.log("User's username: " + u.username);

  res.format({
    "application/json": function(){
      let userObj = {username: u.username, contributing: u.contributing, reviews: u.reviews};
      res.send(userObj);
    },
    "text/html": function(){
      res.render("other_user.pug", { user : u, reviews: uReviews, followStatus: isFollowing });
    }
  });
}

// handles GET request for login page
function loadLogin(req, res){
  if(req.session.loggedin){
    console.log("User is already logged in");
    res.redirect("/profile");
    return;
  }
  res.render("login.pug");
}

// handles GET request for person page
function loadPerson(req, res){
  let personName = req.params.personId;
  let isFollowing = false;

  if(personName === undefined){
    res.status(404).send("person does not exist");
    console.log(personName);
    return;
  }

  console.log("URL Params:" + personName);

  if(!doesPersonExist(personName)){
    res.status(404).send("person does not exist");
    return;
  }
  
  let p = getPerson(personName);

  if(p === null){
    res.status(404).send("No person found");
    return;
  }

  if(req.session.loggedin){
    let userSessionID = getUser(req.session.username);
    console.log(userSessionID);
    if(userSessionID != null && doesFollowExist(p.followers, req.session.username, userSessionID.id)){
      console.log("setting isFollowing to true");
      isFollowing = true;
    }
  }

  // found person with matching name
  console.log("Person Name: " + p.name);

  //Get a persons works
  let works = getPersonWorks(p);
  console.log("Got " + p.name + " works");

  // Send a trimmed version of the persons works to pug file
  let works_trimmed = trimWorks(works);
  console.log("Trimmed " + p.name + " works to 3 or less works");

  let related_ppl = [];
  for(let i = 0 ; i < p.related_ppl.length; i++){
    currPersonId = p.related_ppl[i]
    related_ppl.push(people[currPersonId]);
  }
  
  res.format({
    "application/json": function(){
      let personObj = {name: p.name, works: works};
      res.send(personObj);
    },
    "text/html": function(){
      res.render("person.pug", { person : p, works: works_trimmed, related_ppl: related_ppl, followStatus: isFollowing });
    }
  });
}

// handles GET request for add movie page
function loadAddMovies(req, res){
  res.render("add_movies.pug");
}

// handles GET request for add movie page
function loadAddPerson(req, res){
  res.render("add_person.pug");
}

// handles PUT request for /userType
function changeUserType(req, res){
  let isUserReg = req.body.isRegular;
  let user = getUser(req.session.username);
  if(isUserReg){
    console.log("Switching user to regular");
    user.contributing = false;
  } else{
    console.log("Switching user to contributing")
    user.contributing = true;
  }
  

  // console.log("Logging indiviudal user");
  // console.log(user);

  // console.log("logging user in the database")
  // console.log(users[user.id]);

  // updateUserJSON(users);

  res.status(200).send("Changed user Type");
}

// handles PUT request for /editMovie
function editMovie(req, res){
  // Get the objects and fields of the request body
  let movie_title = req.body.movie_title;
  let dirToAdd = req.body.directors;
  let actorsToAdd = req.body.actors;
  let writersToAdd = req.body.writers;
  console.log("Movie Title: " + movie_title);

  // Get the movie object of the movie to be editted
  let movieToEdit = getMovie(movie_title);

  // Add the directors to the movie object
  for(let i = 0; i < dirToAdd.length; i++){
    // Checks if the director does not already exist, if not, create them
    if(!doesPersonExist(dirToAdd[i])){
      addPersonByMovieID(dirToAdd[i], "directors", movieToEdit.id);
    }
    // Pushes the directors name into the movies directors list
    movieToEdit.directors.push(dirToAdd[i]);
  }
  
  // Add the actors to the movie object
  for(let i = 0; i < actorsToAdd.length; i++){
    if(!doesPersonExist(actorsToAdd[i])){
      addPersonByMovieID(actorsToAdd[i], "actors", movieToEdit.id);
    }
    movieToEdit.actors.push(actorsToAdd[i]);
  }

  // Add the writers to the movie object
  for(let i = 0; i < writersToAdd.length; i++){
    if(!doesPersonExist(writersToAdd[i])){
      addPersonByMovieID(writersToAdd[i], "writers", movieToEdit.id);
    }
    movieToEdit.writers.push(writersToAdd[i]);
  }

  // Notify all Cast members followers of changes
  notify(movieToEdit);

  // Update JSONS for movies and people.
  // updateMoviesJSON(movies);
  // updatePeopleJSON(people);
  
  res.status(200).send("Successfully edited movie");
}

// handles POST request for /review
function updateReview(req, res){

  console.log("checking if user is logged in...");
  if(!req.session.loggedin) {
    console.log("user is not logged in");
    res.status(404).send("User is not logged. redirect to login page")
    return;
  }

  let user = req.session.username;

  let reqReview = req.body;
  console.log("Review sent from request: ");
  console.log(reqReview);

  let keys = Object.keys(reviews)
  console.log(keys)
  let lastId;
  if(keys.length === 0){
    lastId = -1;
  } else {
    lastId = parseInt(keys[keys.length-1]);
  }

  console.log(lastId);

  // Make a new review object.
  let newReview = {};
  newReview.id = lastId+1;
  newReview.userId = getUser(user).id;
  newReview.username = getUser(user).username;
  newReview.movieId = getMovie(reqReview.movie_name).id;
  newReview.movie_name = getMovie(reqReview.movie_name).title;
  newReview.review_text = reqReview.review_text;
  newReview.score = parseInt(reqReview.score); 

  // Update reviews object
  reviews[lastId+1] = newReview;

  console.log(newReview);

  // Need to update average rating of movie
  console.log("numRatings b4: " + movies[newReview.movieId].numRatings)
  movies[newReview.movieId].numRatings++;
  movies[newReview.movieId].sumRatings += newReview.score;
  movies[newReview.movieId].averageRating = movies[newReview.movieId].sumRatings / movies[newReview.movieId].numRatings

  // Update the movies reviews property with new review.
  movies[newReview.movieId].reviews.push(newReview.id);

  // Update the user's reviews property with the new review
  users[newReview.userId].reviews.push(newReview.id);

  // Notify all of the user's followers that they have made a review
  reviewNotify(users[newReview.userId]);

  // updateReviewJSON(reviews);
  // updateMoviesJSON(movies);
  // updateUserJSON(users);

  res.status(200).send("Successfully added review");
}

// handles POST request for /movies
function addMovie(req, res){
  // Takes in JSON
  let newMovie = req.body;

  // Check if JSON is valid (has minimum info)
  if(!newMovie.title ||  !newMovie.genre || !newMovie.directors || !newMovie.actors || !newMovie.writers || !newMovie.plot || !newMovie.runtime || !newMovie.released){
    res.status(404).send("Invalid movie information");
    return;
  }

  // Check if movie already exists
  if(getMovie(newMovie.title) != null){
    res.status(404).send("Movie with this name already exists");
    return;
  }

  // Movie is valid, create rest of movie object
  let keys = Object.keys(movies);
  let lastId = parseInt(keys[keys.length-1]);
  console.log("Last ID in movies: " + lastId);

  // Set rest of required fields of newMovie
  newMovie.id = lastId + 1;
  newMovie.averageRating = 0;
  newMovie.numRatings = 0;
  newMovie.sumRatings = 0;
  newMovie.poster = "https://www.brdtex.com/wp-content/uploads/2019/09/no-image-480x480.png";
  newMovie.ratings = [{Source: "N/A", Value: "0/10"}];
  newMovie.reviews = [];
  newMovie.similar = recommended(movies);
  newMovie.Title_Encoded = encodeURIComponent(newMovie.title);

  // Update movies object
  movies[lastId +1] = newMovie;

  console.log("Updating people object");
  updatePeople(movies[lastId + 1]);

  notify(newMovie);

  // Update movie-data.json file with new movie and people-data.json file if needed.
  // updateMoviesJSON(movies);
  // updatePeopleJSON(people);

  // Send good status (200)
  res.status(200).send(movies[lastId + 1]);
}

// handles POST request for /people
function addPeopleReq(req, res){
  let newPersonName = req.body.name;

  let status = addPerson(newPersonName);
  if(!status){
    res.status(404).send("Person with name: " + newPersonName + " already exists.");
    return;
  }

  console.log("Updating people JSON");
  // updatePeopleJSON(people);

  res.status(200).send("Successfully added person: " + newPersonName + " to the database");
}

// handles POST request for /follow
function follow(req, res){
  // Parsing the request body to get name of the person to follow
  let personToFollow = req.body.personToFollow;
  let personType = req.body.personType;

  let followerName;

  // Checking to make sure person trying to follow is logged in
  if(!req.session.loggedin){
    res.status(401).send("You must be logged in to follow");
    return;
  } 

  // Getting the username of the user trying to follow someone
  followerName = req.session.username;

  let status = addFollower(personToFollow, followerName, personType);

  if(status){
    res.status(200).send("successfully followed person");
  } else {
    //TODO: status 400 or status 500?
    console.log("something went wrong with add follower");
    res.status(400).send("unable to follow user. you may already follow this person. or person does not exist");
  }
}

// handles POST request for /unfollow
function unfollow(req, res){
  console.log("inside unfollow");
  // Parsing the request body to get name of the person to follow
  let personToFollow = req.body.personToFollow;
  let personType = req.body.personType;

  let followerName;

  // Checking to make sure person trying to follow is logged in
  if(!req.session.loggedin){
    res.status(401).send("You must be logged in to unfollow");
    return;
  } 

  // Getting the username of the user trying to follow someone
  followerName = req.session.username;

  let status = removeFollower(personToFollow, followerName, personType);

  if(status){
    res.status(200).send("successfully unfollowed person");
  } else {
    //TODO: status 400 or status 500?
    console.log("something went wrong with removing follower");
    res.status(400).send("unable to follow user. you may already follow this person. or person does not exist");
  }
}

/* =========================================== BUSINESS LOGIC =========================================== */

// Function for searching/fitlering through movies by title
function filter_movies_title(search, movieList){
  let filtered = [];

  for(let movieId in movieList){
    let currTitle = movieList[movieId].title.toUpperCase();
    let newSearch = search.toUpperCase();

    //console.log(currTitle);
    if(currTitle.includes(newSearch)){
      filtered.push(movieList[movieId]);
    }
  }
  // console.log(filtered)
  return filtered;
}

// Function for searching/fitlering through movies by genre
function filter_movies_genre(search, movieList){
  let filtered = [];

  for(let movieId in movieList){
    let genres = movieList[movieId].genre;
    let newSearch = search.toUpperCase();

    //console.log(genres);

    //console.log(currTitle);
    for(let i = 0; i < genres.length; i++){
      currGenre = genres[i].toUpperCase();
      //console.log(currGenre);
      if(currGenre.includes(newSearch)){
        //console.log("found match");
        filtered.push(movieList[movieId]);
      }
    }
    
  }
  // console.log(filtered)
  return filtered;
}

// Function for searching/fitlering through movies by year
function filter_movies_year(search, movieList){
  let filtered = [];

  for(let movieId in movieList){
    let currRelease = movieList[movieId].released.toUpperCase();
    let currYear = currRelease.substr(currRelease.length-4);
    let newSearch = search.toUpperCase();

    //console.log(currTitle);
    if(currYear == newSearch){
      filtered.push(movieList[movieId]);
    }
  }
  // console.log(filtered)
  return filtered;
}

// Function for searching/fitlering through movies by rating
function filter_movies_rating(search, movieList){
  let filtered = [];

  let newSearch = parseInt(search);

  for(let movieId in movieList){
    let currRating = parseInt(movieList[movieId].averageRating);

    if(currRating >= newSearch){
      filtered.push(movieList[movieId]);
    }
  }
  // console.log(filtered)
  return filtered;
}

// Function that determines the intersection of 2 lists
function intersection(a1, a2){
  let intersected = [];

  for(let i = 0; i < a1.length; i++){
    for(let j = 0; j < a2.length; j++){
      if(a1[i].id === a2[j].id && !movieExistsById(intersected, a1[i].id)){
        intersected.push(a1[i]);
      }
    }
  }
  return intersected;
}
// Function that checks if a movie exists with the given id
function movieExistsById(movieList, id){

  for(let i = 0; i < movieList.length; i++){
    if (movieList[i].id === id) {
      return true
    }
  }

  return false
}

// Function for searching/fitlering through users by username
function filter_users(search, userList){
  let filtered = [];

  for(let userId in userList){

    let currUser = userList[userId].username.toUpperCase();
    let newSearch = search.toUpperCase();

    if(currUser.includes(newSearch)){
      filtered.push(userList[userId]);
    }
  }
  return filtered;
}

// Function for searching/fitlering through people (actors/directors/writers) by name
function filter_people(search, peopleList){
  let filtered = [];
  console.log(search);

  for(let peopleId in peopleList){
    let currPerson = peopleList[peopleId].name.toUpperCase();
    let newSearch = search.toUpperCase();

    //console.log(currTitle);
    if(currPerson.includes(newSearch)){
      filtered.push(peopleList[peopleId]);
    }
  }
  return filtered;
}

// Function for retrieving a movie object given a movie title
function getMovie(movieName){
  let movieList = filter_movies_title(movieName, movies)
  if(movieList.length === 0){
    return null;
  }
  let movie = movieList[0] 
  return movie;
}

// Function for retrieving a user object given a username
function getUser(username){
  let userList = filter_users(username, users)
  if(userList.length === 0){
    return null;
  }
  let user = userList[0] 
  return user;
}

// Function for retrieving a person object given a name
function getPerson(name){
  let peopleList = filter_people(name, people)
  if(peopleList.length === 0){
    return null;
  }

  for(let i = 0; i < peopleList.length; i++){
    if(name === peopleList[i].name){
      return peopleList[i];
    }
  }
  return peopleList[0];
}

// Function for making recommended movies for a movie
function recommended(movieList){
  let recommended = [];
  
  let keys = Object.keys(movieList);

  while(recommended.length < 3){
    randIndex = Math.floor(Math.random() * keys.length);
    if(!recommended.includes(randIndex))
      recommended.push(randIndex);
  }
  return recommended;
}

// Function for selecting a list of related people
function selectRelatedPpl(people){
  let related = [];

  let keys = Object.keys(people);

  while(related.length < 5){
      randIndex = Math.floor(Math.random() * keys.length);
      if(!related.includes(randIndex)){
          related.push(randIndex);
      }
  }
  return related;
}

// Function for retrieving a persons works
function getPersonWorks(p){
  let works = [];
  
  //console.log(p); 
  for(let i = 0; i < p.directed.length; i++){
    let movieId = p.directed[i];

    if(!works.includes(movies[movieId]))
      works.push(movies[movieId]);
  }

  for(let i = 0; i < p.written.length; i++){
    let movieId = p.written[i];
    
    if(!works.includes(movies[movieId]))
      works.push(movies[movieId]);
  }

  for(let i = 0; i < p.acted.length; i++){
    let movieId = p.acted[i];
    
    if(!works.includes(movies[movieId]))
      works.push(movies[movieId]);
  }

  return works;
}

// Function for trimming down the works of a person
function trimWorks(works){
  let works_trimmed = [];

  for(let i = 0; i < 3; i++){
    works_trimmed.push(works[i]);
  }
  return works_trimmed;
}

// Function for searching/fitlering through movies by title
function updatePeople(newMovie){
  // If they do not exist in people json, create a new person and add them.
  // Update person's works (directed, written, acted property)

  // Update people-data.json with new person
  let type = ["directors", "writers", "actors"];

  let exists = false;

  // Loop through all people, (director, writer, actors)
  for(let i = 0; i < type.length; i++){
    for(let j = 0; j < newMovie[type[i]].length; j++){
      personName = newMovie[type[i]][j];
      console.log("person name: " + personName);
      console.log("Current Type: " + type[i]);
      exists = doesPersonExist(personName);
      if(exists){
        // Update works of person?
        let status = updatePerson(personName, type[i], newMovie.id);
        if(!status) {
          console.log("In updatePeople function");
          console.log("unable to update person, " + personName + ", works");
        } else {
          console.log("In updatePeople function");
          console.log("Successfully updated persons works");
        }
      } else {
        // Create person
        console.log("Person does not exist, we need to add " + personName);
        addPersonByMovieID(personName, type[i], newMovie.id);
        console.log("Finished adding person " + personName);
      }
    }
  }
}

// Function for checking if a person exists based on a name
function doesPersonExist(personName){
  let exists = false;

  // Loop over id properties of people object
  for(let id in people){
    if(people[id].name === personName){
      exists = true;
      break;
    }
  }
  return exists;
}

// Function for adding a person to the database given a type (actor/director/writer) and a movieId
function addPersonByMovieID(name, type, movieId){
  console.log("In addPerson(" + name + ", " + type + ", " + movieId + ")");

  if(!addPerson(name)){
    console.log("person with name: " + name + " already exists");
  }
  console.log("person with name " + name + " is in our database");

  let status = updatePerson(name, type, movieId);
  if(!status) {
    console.log("Inside addPerson function")
    console.log("unable to update person, " + name + ", works")
  } else {
    console.log("Inside addPerson function")
    console.log("Successfully updated persons works");
  }
}

// Function for updating a person object to match all the movies theyve been in
function updatePerson(name, type, movieId){
  let p = getPerson(name);

  console.log("In update person");
  console.log("type of person: " + type);

  if(type != "directors" && type != "actors" && type != "writers"){
    return false
  }

  if(type === "directors"){
    p.directed.push(movieId);
  } 
  if (type === "actors"){
    p.acted.push(movieId);
  } 
  if(type === "writers"){
    p.written.push(movieId)
  } 
  return true;
}

// Function for adding a person to the system  
function addPerson(name){
  // Checking if person already exists
  if(doesPersonExist(name)){
    return false;
  }

  let p = {};
  
  let keys = Object.keys(people);
  let lastId = parseInt(keys[keys.length-1]);

  p.id = lastId + 1;
  p.name = name;
  p.directed = [];
  p.written = [];
  p.acted = []
  p.related_ppl = selectRelatedPpl(people);
  p.followers = [];
  p.bio = "A prominent hollywood person who acted, wrote or directed some movies.";
  p.pic = "https://us.123rf.com/450wm/mialima/mialima1603/mialima160300025/55096766-stock-vector-male-user-icon-isolated-on-a-white-background-account-avatar-for-web-user-profile-picture-unknown-ma.jpg?ver=6";

  people[lastId + 1] = p;

  return true;
}

// Function for allowing users to follow eachother
function addFollower(nameA, nameB, type){
  let follower = getUser(nameB);
  let personToFollow;

  // Checks to make sure the person following exists.
  if(follower === null){
    console.log("follower was resolved to null")
    return false;
  }

  // Gets person object based on their type (people vs users)
  if(type === "person"){
    console.log("person being followed is a person type");
    personToFollow = getPerson(nameA);
    personToFollowName = personToFollow.name
    console.log(personToFollowName);
  }else if(type === "user"){
    console.log("Person being followed is a user type");
    personToFollow = getUser(nameA);
    personToFollowName = personToFollow.username
    console.log(personToFollowName);
  }

  if(doesFollowExist(follower.follows, personToFollowName, personToFollow.id)){
    console.log("person already follows the person in question");
    return false;
  } else{
    // update userA's follows list
    follower.follows.push({name: personToFollowName, id:personToFollow.id, pType: type});
    console.log("Updated " + follower.username + " follows list");

    // update usersB's followers list
    personToFollow.followers.push({name: follower.username , id:follower.id, pType: type});
    console.log("Updated " + personToFollowName + " followers list");
  }
  
  // Check if the person is being followed is a user or a person
  if(type === "user"){
    // Send a notification taht this person has been followed
    let msg = follower.username + " has followed you.";
    sendNotif(msg, personToFollow);
    console.log("Sent notification")
  }

  console.log("Follow successful");
  return true;
}

// Function for allowing users to unfollow eachother
function removeFollower(nameA, nameB, type){
  let follower = getUser(nameB);
  let personToFollow;

  // Checks to make sure the person following exists.
  if(follower === null){
    console.log("follower was resolved to null")
    return false;
  }

  // Gets person object based on their type (people vs users)
  if(type === "person"){
    console.log("person being followed is a person type");
    personToFollow = getPerson(nameA);
    personToFollowName = personToFollow.name
    console.log(personToFollowName);
  }else if(type === "user"){
    console.log("Person being followed is a user type");
    personToFollow = getUser(nameA);
    personToFollowName = personToFollow.username
    console.log(personToFollowName);
  }

  if(!doesFollowExist(follower.follows, personToFollowName, personToFollow.id)){
    console.log("person is already not following the person in question");
    return false;
  } else{
    // update userA's follows list
    let indexToRemove = returnFollowIndex(follower.follows, personToFollowName, personToFollow.id)
    follower.follows.splice(indexToRemove, 1);
    console.log("Updated " + follower.username + " follows list");

    // update usersB's followers list
    indexToRemove = returnFollowIndex(personToFollow.followers, follower.username, follower.id);
    personToFollow.followers.splice(indexToRemove, 1);
    console.log("Updated " + personToFollowName + " followers list");
  }
  
  // Check if the person is being followed is a user or a person
  if(type === "user"){
    // Send a notification taht this person has been followed
    let msg = follower.username + " has un-followed you.";
    sendNotif(msg, personToFollow);
    console.log("Sent notification")
  }

  console.log("Unfollow successful");
  return true;
}

// Function for checking if someone is already in someones follows or follower's list
function doesFollowExist(followList, name, id){
  console.log("Inside doesFollowExist")
  console.log(followList);
  console.log(name);
  console.log(id);
  for(let i = 0; i < followList.length; i++){
    console.log("==" + followList[i].name);
    console.log("==" + followList[i].id);
    if(followList[i].name === name && followList[i].id === id){
      console.log("returned true");
      return true;
    }
  }
  console.log("returned false");
  return false;
}

// Function for retrieving the index of a user in someone's follower or follows list
function returnFollowIndex(followList, name, id){
  let index = -1;

  for(let i = 0; i < followList.length; i++){
    if(followList[i].name === name && followList[i].id === id){
      console.log("returned index: " + i);
      index = i;
      break;
    }
  }
  return index;
}

// Function for notifying all people's followers of an update
function notify(movieObj){
  let type = ["directors", "writers", "actors"];

  // Loop over cast (directors/actors/writers)
  for(let i = 0; i < type.length; i++){
    // Loops over each person in the current type (directors/actors/writers)
    for(let j = 0; j < movieObj[type[i]].length; j++){
      let pName = movieObj[type[i]][j]; // The current persons name
      let pObj = getPerson(pName); // The entire persons object.

      // Loop over the person's followers.
      for(let k = 0; k < pObj.followers.length; k++){
        let msg = pObj.name + " is featured in: '" + movieObj.title + "' as a " + type[i] + "."; 
        let userToNotify = users[pObj.followers[k].id];

        sendNotif(msg, userToNotify);
      }
    }
  }
}

// Function for notifying a users followers of a new review
function reviewNotify(userObj){
  // Loop over all users followers
  console.log("In reviewNotify");
  console.log(userObj);
  for(let i = 0; i < userObj.followers.length; i++){
    let userToNotify = users[userObj.followers[i].id];
    let msg = userObj.username + " has created a new review.";

    sendNotif(msg, userToNotify);
  }
}

// Function for sending notifications to the inbox of a certain user
function sendNotif(msg, user){
  console.log("BEFORE:");
  console.log(user);
  user.notifications.unshift(msg);
  console.log("AFTER:");
  console.log(user);
}

app.listen(3000);
console.log("Server Listening on http://localhost:3000");


/* =========================================== OLD CODE FOR CREATING/UPDATING JSONS =========================================== */

// function updateMoviesJSON(moviesList){
//   fs.writeFile(path.join(__dirname + "/data/movie-data-faheem.json"), JSON.stringify(moviesList), function(err) {
//     if (err) throw err;
//     console.log("Wrote new movie-data JSON file...");
//   });

//   // Need to require new movies json
//   movies = require(path.join(__dirname + "/data/movie-data-faheem.json"));
// }

// function updateUserJSON(usersList){
//   fs.writeFile(path.join(__dirname + "/data/user-data.json"), JSON.stringify(usersList), function(err) {
//     if (err) throw err;
//     console.log("Wrote new user-data JSON file...");
//   });

//   // Need to require new users json
//   users = require(path.join(__dirname + "/data/user-data.json"));
// }

// function updatePeopleJSON(peopleList){
//   fs.writeFile(path.join(__dirname + "/data/people-data-faheem.json"), JSON.stringify(peopleList), function(err) {
//     if (err) throw err;
//     console.log("Wrote new people-data JSON file...");
//   });

//   // Need to require new people json
//   people = require(path.join(__dirname + "/data/people-data-faheem.json"));
// }

// function updateReviewJSON(reviews){
//   fs.writeFile(path.join(__dirname + "/data/review-data.json"), JSON.stringify(reviews), function(err) {
//     if (err) throw err;
//     console.log("Wrote new review-data JSON file...");
//   });

//   // Need to require new review json
//   reviews = require(path.join(__dirname + "/data/review-data.json"));
// }