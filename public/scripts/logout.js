let logout = document.getElementById("logout").addEventListener("click", function logout() {
  console.log("logout button pressed.");

  let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function(){	
		if(this.readyState == 4 && this.status == 200){
      alert("Successfully logged out. Redirecting to login page.");
      window.location = "/login";
    }
    if(this.readyState == 4 && this.status == 401){
      alert("You are not logged in. Redirecting to login page.");
      window.location = "/login";
    }
  }

  xhttp.open("GET","/logout",true);
	xhttp.send();
})