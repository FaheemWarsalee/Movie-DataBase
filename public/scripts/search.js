// Event handler for when the GO button is pressed for searching
let searchGo = document.getElementById("go").addEventListener("click", function search(){
  let searchTxt = document.getElementById("searchbox").value;

  // determines what kind of search is being made (movies vs user vs people)
  let type = document.getElementById("type").innerText;
  console.log(type);

  //Make requests through window.location based on the type of search
  if(type.includes("Movie")){
    // Get the search query parameter to search movies by (title, genre, year, rating)
    let searchType = document.getElementById("searchType").value.toLowerCase();
    console.log("Search type value: " + searchType);

    // make appropriate browser request to certain page based on the searchType (title, genre, year, rating)
    if(searchType === "title"){
      // Search based on title
      let url = encodeURI("/movies?title=" + searchTxt);
      window.location = url;
    } else if (searchType === "genre"){
      // Search based on genre
      let url = encodeURI("/movies?genre=" + searchTxt);
      window.location = url;
    } else if(searchType === "year"){
      // Search based on year
      let url = encodeURI("/movies?year=" + searchTxt);
      window.location = url;
    } else if(searchType === "rating"){
      // Search based on rating
      let url = encodeURI("/movies?minrating=" + searchTxt);
      window.location = url;
    }
    
  } else if(type.includes("User")){
    let url = encodeURI("/users?name=" + searchTxt);
    window.location = url;
  } else if(type.includes("People")){
    let url = encodeURI("/people?name=" + searchTxt);
    window.location = url;
  }
})



