var express = require("express");
var app = express();
var months = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];

var flag = true; // true -> unix timestamp; false -> natural language

app.get("/", function(req, res){
  res.send('Timestamp microservice. Type a Unix timestamp (seconds) or natural language form of the date (MMM DD, YYYY).');
});

app.get("/:strDate", function(req, res){
  var strDate = req.params.strDate;
  checkFlag(strDate); // checks if input is unix timestamp (number) or natural language (letter)

  if (flag){ // unix timestamp
    var date = new Date(strDate * 1000); // ms to sec

    var day = date.getUTCDate();
    var mon = date.getUTCMonth();
    var year = date.getUTCFullYear();

    return res.send("{ \"unix\": " + strDate + ", \"natural\": \"" + months[mon] + " " + day + ", " + year + "\" }");
  } else { // natural language
    var unixDate = new Date(strDate);

    var day = unixDate.getUTCDate();
    var mon = unixDate.getUTCMonth();
    var year = unixDate.getUTCFullYear();
    var tzOffset = unixDate.getTimezoneOffset();

    unixDate = Math.floor(unixDate/1000 - tzOffset * 60); // ms to sec and remove offset

    if (unixDate === undefined || months[mon] === undefined || day === undefined || year === undefined){
      return res.send("{ \"unix\": null, \"natural\": null }");
    }

    return res.send("{ \"unix\": " + unixDate + ", \"natural\": \"" + months[mon] + " " + day + ", " + year + "\" }");
  }
});

app.get("*", function(req, res){
  console.log("Page not found");
  res.send("Page not found.");
});

function checkFlag(str){
  if (str[0] === /^[a-z]+/, 'i'){ // first input is a letter
      return flag = false;
  }
  return flag = true; // first input is a number
}

app.listen(process.env.PORT || 3000, process.env.IP, function(){
  console.log("server is running");
});
