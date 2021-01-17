let submitButton = document.getElementById("submitButton").addEventListener("click", function addMovie(){
  console.log("Submit button pressed");

  let title = document.getElementById("movieTitle").value;
  let genre = document.getElementById("movieGenre").value;
  let directors = document.getElementById("movieDirectors").value;
  let actors = document.getElementById("movieActors").value;
  let writers = document.getElementById("movieWriters").value;
  let plot = document.getElementById("moviePlot").value;
  let released = document.getElementById("movieReleased").value;
  let runtime = document.getElementById("movieRuntime").value;

  let emptyField = title.length == 0 || genre.length == 0 || directors.length == 0 || actors.length == 0 || writers.length == 0 || plot.length == 0 || released.length == 0 || runtime.length == 0;

  if(emptyField){
    alert("All textboxes must be filled out. Genre, Directors, Actors, Writers must be comma seperated.");
    return
  }

  let genreList = genre.split(",");
  let dirList = directors.split(",");
  let actorList = actors.split(",");
  let writerList = writers.split(",");

  let newMovie = {
                    title: title, 
                    genre: genreList, 
                    directors: dirList, 
                    actors: actorList, 
                    writers: writerList,
                    plot: plot,
                    released: released,
                    runtime: runtime + " min"
                  }

  console.log(newMovie);
  

  sendAddMovie(newMovie);
});

function sendAddMovie(newMovie){
  let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function(){	
		if(this.readyState == 4 && this.status == 200){
      alert("Successfully added new movie to database");
      window.location = encodeURI("movies/"+ newMovie.title);
    }
    if(this.readyState == 4 && this.status == 404){
      alert("Error: Could not add movie to database. Movie may already exist in the database.");
      window.location = encodeURI("/movies");
    }
  }
  

  xhttp.open("POST","/movies",true);
  xhttp.setRequestHeader("Content-type", "application/json");
	xhttp.send(JSON.stringify(newMovie));
}