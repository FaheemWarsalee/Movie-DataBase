// Create event handler for when login button is clicked
let loginButton = document.getElementById("loginButton").addEventListener("click", function login(){
  console.log("Login button pressed");

  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  if(username.length === 0 || password.length == 0){
    alert("You must enter a username and password.");
    return;
  }

  let user = {username: username, password: password};

  loginReq(user);
})

// Function for sending AJAX request for logging in
function loginReq(user){
  let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function(){	
		if(this.readyState == 4 && this.status == 200){
      alert("Successfully logged in.");
      window.location = "/profile";
    }
    if(this.readyState == 4 & this.status == 401){
      alert("Invalid login credentials");
    }
  }

  // console.log("in POST request:");
  // console.log(user);

  xhttp.open("POST","/login",true);
  xhttp.setRequestHeader("Content-type", "application/json");
	xhttp.send(JSON.stringify(user));
}

// Create event handler for when trying to signup
let signUpButton = document.getElementById("signUpButton").addEventListener("click", function signup(){
  console.log("sign up button pressed");

  let username = document.getElementById("regUsername").value;
  let password = document.getElementById("regPassword").value;

  if(username.length === 0 || password.length == 0){
    alert("You must enter a username and password.");
    return;
  }

  let user = {username: username, password: password};
  
  signUpReq(user);
});

// Function for sending AJAX request for signing up
function signUpReq(user){
  let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function(){	
		if(this.readyState == 4 && this.status == 200){
      alert("Successfully Registered!");
      window.location = "/profile";
    }
    if(this.readyState == 4 & this.status == 401){
      alert("User already exists with username: " + user.username);
    }
  }

  // console.log("in POST request:");
  // console.log(user);

  xhttp.open("POST","/signup",true);
  xhttp.setRequestHeader("Content-type", "application/json");
	xhttp.send(JSON.stringify(user));
}

