let submitButton = document.getElementById("submitButton").addEventListener("click", function addPerson(){
  console.log("Submit button pressed");

  let name = document.getElementById("personName").value;

  if(name.length === 0 ){
    alert("Name textbox must be filled out.");
    return;
  }

  newPerson = {name: name}

  console.log(newPerson);

  sendAddPerson(newPerson)
});

function sendAddPerson(newPerson){
  let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function(){	
		if(this.readyState == 4 && this.status == 200){
      alert("Successfully added new person to database.");
      window.location = encodeURI("/people/"+ newPerson.name);
    }
    if(this.readyState == 4 && this.status == 404){
      alert("404 Error: Could not add person to database. Person may already exist in the database.");
      window.location = encodeURI("/people");
    }
  }

  xhttp.open("POST","/people",true);
  xhttp.setRequestHeader("Content-type", "application/json");
	xhttp.send(JSON.stringify(newPerson));
}