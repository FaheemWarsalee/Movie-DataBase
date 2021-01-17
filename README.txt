---- AUTHOR ----
Faheem Warsalee
101147978


---- PROJECT ----
Movie Database Project 


---- FILES/FOLDERS ----
data folder:
  - Contains the JSON data files movie-data.json, people-data.json, user-data.json, review-data.json, which is used in server.js file.

public folder:
  - Contains css and scripts folders
    - css folder contains the style.css which has the styling for all my webpages
    - scripts folder has all my front end javascript which uses DOM and AJAX to send requests to the server.

views folder:
  - Contains all front end pug files that are displayed on the website (login.pug, movie.pug, other_user.pug, person.pug, search.pug, user.pug and more..)

logic.js
  - This is my offline business logic implementation which also runs tests on the business logic functions. (NOT USED) (FROM CHECK-IN 2)

server.js
  - This is my web server implementation using express which serves my webpages and functionality of my project.

package.json
  - The JSON file used to install all my node packages/dependencies. In the main directory run the comman "npm install" to install the required dependencies.

README.txt
  - This README file containing information on my project.

2406-Project-Report.pdf
  - My final project report which outlines how to login to my OpenStack instance and a report of my project and all of it's functionality.

2406-Project-Report.docx
  - My final project report as a Microsoft Word document as a backup incase the pdf is not working (backup).


---- SYSTEM EXTENSIONS ----
The NPM modules and dependencies I have in my system are:
 - express
 - express-session
 - pug

All modules and dependencies can be installed using the "npm install" command in terminal from the directory/folder containing server.js

---- OPEN STACK SERVER ----
All information and steps required to run my OpenStack server instance.

public IP address: 134.117.128.8

username: student
password: faheem2406

Instructions for initializing OpenStack instance:
1) Open powershell and connect to my instance using ssh student@134.117.128.8.
2) Enter my password (faheem2406).
3) In the instance cd into the directory 2406-Project.
4) All node modules should already be installed if they are not, simply run the command "npm install" in the terminal.
5) Run the server by using the command "node server.js" in the terminal.
6) In another powershell window run the command "ssh -L 9999:localhost:3000 student@134.117.128.8" and enter my password (faheem2406).
7) Access the website by going to http://localhost:9999/ in your browser.




