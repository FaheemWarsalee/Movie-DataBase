// let reviews = [];

let submitReview = document.getElementById("submitReview").addEventListener("click", function addReview(){
  console.log("Button Pressed");
  let text = document.getElementById("userReview").value;
  let score = document.getElementById("score").value;

  let movie = document.getElementById("movieName").innerHTML;

  
  // if(text.length === 0){
  //   alert("Text box empty. Try again.");
  //   return;}
  if(score.length === 0 || isNaN(score) || score < 0 || score > 10){
    alert("Please enter a valid score. range (0-10).");
    return;
  }

  // Using the 'text' variable and 'score' variable create a JSON object
  let newReview = {
                    'movie_name' : movie,
                    'score' : score,
                    'review_text' : text
                  };

  // Insert AJAX template of request here
  // POST Request to the route '/review'
  // Content-type set to JSON
  sendReview(newReview);
  // render(reviews); DONT USE THIS
  // NEED TO MANUALLY ADD THE NEW REVIEW YOURSELF TO THE PAGE
});

function sendReview(newReview){
  let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function(){	
		if(this.readyState == 4 && this.status == 200){
      console.log("readyState is 4 and status is 200");
      alert("Successfully submitted review");
      location.reload();
    }
    if(this.readyState == 4 && this.status == 404){
      alert("You must be logged in to add a review. redirecting to login page.");
      window.location = "/login";
      return;
    }
  }

  console.log("in POST request:");
  console.log(newReview);

  xhttp.open("POST","/review",true);
  xhttp.setRequestHeader("Content-type", "application/json");
	xhttp.send(JSON.stringify(newReview));
}

