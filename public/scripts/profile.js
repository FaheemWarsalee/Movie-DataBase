let regularCheck = document.getElementById("regular").addEventListener("click", changeUserType);
let contributingCheck = document.getElementById("contributing").addEventListener("click", changeUserType);

function changeUserType(){

  let isReg = document.getElementById("regular").checked;
  let isCon = !isReg;

  console.log("is Regular user? " + isReg);
  console.log("is Contributing user? " + isCon);

  sendChangeUser(isReg);
}

function sendChangeUser(isReg){

  let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function(){	
		if(this.readyState == 4 && this.status == 200){
      if(isReg)
        alert("Successfully switched to regular user");
      else
        alert("Successfully switched to contributing user");
		}
  }



  xhttp.open("PUT","/userType",true);
  xhttp.setRequestHeader("Content-type", "application/json");
	xhttp.send(JSON.stringify({"isRegular": isReg}));
}