
let followButton = document.getElementById("follow");
if (followButton) {
  followButton.addEventListener("click", follow);
}

let unfollowButton = document.getElementById("unfollow");
if (unfollowButton) {
  unfollowButton.addEventListener("click", unfollow);
}
function follow(){
  // Get name of person they are following
  let name = document.getElementById("follow").getAttribute("name");
  let type = document.getElementById("profileName").getAttribute("name");

  console.log(name);
  console.log(type);


  let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function(){	
    if(this.readyState == 4 && this.status == 200){
      alert("You have followed " + name + "!");
      location.reload();
    } else if (this.readyState == 4 && this.status == 401){
      alert("You must be logged in to follow people. Redirecting to login page.");
      window.location = encodeURI("/login");
    }
  }
  

  xhttp.open("POST","/follow",true);
  xhttp.setRequestHeader("Content-type", "application/json");
	xhttp.send(JSON.stringify({personToFollow: name, personType: type}));
}

function unfollow() {
  // Get name of person they are following
  let name = document.getElementById("unfollow").getAttribute("name");
  let type = document.getElementById("profileName").getAttribute("name");

  console.log(name);
  console.log(type);


  let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function(){	
    if(this.readyState == 4 && this.status == 200){
      alert("You have unfollowed " + name + "!");
      location.reload();
    } else if (this.readyState == 4 && this.status == 401){
      alert("You must be logged in to follow people. Redirecting to login page.");
      window.location = encodeURI("/login");
    }
  }
  

  xhttp.open("POST","/unfollow",true);
  xhttp.setRequestHeader("Content-type", "application/json");
	xhttp.send(JSON.stringify({personToFollow: name, personType: type}));
}