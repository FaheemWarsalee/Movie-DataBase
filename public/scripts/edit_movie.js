let submitButton = document.getElementById("submitButton").addEventListener("click", function editMovie(){

  let directors = document.getElementById("movieDirectors").value;
  let actors = document.getElementById("movieActors").value;
  let writers = document.getElementById("movieWriters").value;

  let movie_name = document.getElementById("movieName").innerHTML;

  if(directors.length == 0 && actors.length == 0 && writers.length == 0){
    alert("you must fill out atleast one of the three boxes.")
    return;
  }

  let dirList;
  let actorList;
  let writerList;

  if(directors.length == 0){
    dirList = [];
  } else {
    dirList = directors.split(",");
  }

  if(actors.length == 0){
    actorList = [];
  } else {
    actorList = actors.split(",");
  }

  if(writers.length == 0){
    writerList = [];
  } else {
    writerList = writers.split(",");
  }

  let updatedPpl = {
                        directors: dirList,
                        actors: actorList,
                        writers: writerList,
                        movie_title: movie_name
                      }

  sendEditMovie(updatedPpl)
});

function sendEditMovie(updatedPpl){
  let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function(){	
		if(this.readyState == 4 && this.status == 200){
      alert("Successfully edited movie. changes saved to database");
      location.reload();
    }
    if(this.readyState == 4 && this.status == 404){
      alert("Error: Could not edit movie.");
      window.location = encodeURI("/movies");
    }
  }
  

  xhttp.open("PUT","/editMovie",true);
  xhttp.setRequestHeader("Content-type", "application/json");
	xhttp.send(JSON.stringify(updatedPpl));
}