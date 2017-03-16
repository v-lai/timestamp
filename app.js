var express = require("express");
var app = express();
app.use(express.static('public'))
var months = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];

var flag = true; // true -> unix timestamp; false -> natural language

app.get("/", function(req, res){
  res.render('index');
});

app.get("/:strDate", function(req, res){
  var strDate = req.params.strDate;
  checkFlag(strDate); // checks if input is unix timestamp (number) or natural language (letter)

  if (flag){ // unix timestamp
    var date = new Date(strDate * 1000); // ms to sec

    var day = date.getUTCDate();
    var mon = date.getUTCMonth();
    var year = date.getUTCFullYear();

    return res.send(JSON.stringify({ unix: strDate, natural: months[mon] + " " + day + ", " + year }, null, '\t'));
  } else { // natural language
    var unixDate = new Date(strDate);

    var day = unixDate.getUTCDate();
    var mon = unixDate.getUTCMonth();
    var year = unixDate.getUTCFullYear();
    var tzOffset = unixDate.getTimezoneOffset();

    unixDate = Math.floor(unixDate/1000 - tzOffset * 60); // ms to sec and remove offset

    if (unixDate === undefined || months[mon] === undefined || day === undefined || year === undefined){
      return res.send(JSON.stringify({ unix: null, natural: null }, null, '\t'));
    }

    return res.send(JSON.stringify({ unix: Number(unixDate), natural: months[mon] + " " + day + ", " + year }, null, '\t'));
  }
});

app.get("/api/timestamp/", function(req,res){
  var milliseconds = Date.now();
  var today = new Date(milliseconds);
  var UTCstring = today.toUTCString();
  return res.send(JSON.stringify({ unix: milliseconds, utc: UTCstring }, null, '\t'));
});

app.get("/api/timestamp/:strDate", function(req,res){
  var strDate = req.params.strDate;
  checkLength(strDate); // checks if input is unix timestamp (number) or date string

  if (flag){ // unix timestamp
    var date = new Date(Number(strDate)); // ms
    var UTCstring = date.toUTCString();
    if (!Number(strDate)){
      return res.send(JSON.stringify({ error: "Invalid Date" }, null, '\t'));
    }
    return res.send(JSON.stringify({ unix: Number(strDate), utc: UTCstring }, null, '\t'));
    
  } else { // date string
    var day = strDate.split('-')[2];
    var mon = strDate.split('-')[1] - 1; // months off by 1 for 0 - 11
    var year = strDate.split('-')[0];
    console.log(year);
    if (year.length === 1){ // force year to UTC 1900+
      year = "190" + year;
    }
    if (year.length === 2){
      year = "19" + year; // force year to UTC 1900+
    }
    while (year.length < 4){
      year = "0" + year;
    }
    console.log(year);
    var ISOString = (new Date (Date.UTC(year, mon, day))).toISOString().split('T')[0];
    var UTCstring = (new Date (Date.UTC(year, mon, day))).toUTCString();
    var unixDate = Date.parse(UTCstring);

    mon += 1; // for months 1 - 12
    if (mon < 10){ // zero padding
      mon = "0" + mon;
    }
    if (day < 10){ // zero padding
      day = "0" + day;
    }
console.log(ISOString, year + '-' + mon + '-' + day);
    if (ISOString !== year + '-' + mon + '-' + day){
      return res.send(JSON.stringify({ error: "Invalid Date" }, null, '\t'));
    }

    return res.send(JSON.stringify({ unix: unixDate, utc: UTCstring }, null, '\t'));
  }
});

app.get("*", function(req, res){
  res.send("Page not found.");
});

function checkFlag(str){
  if (/^\D/i.test(str)){ // first input is a letter
      return flag = false;
  }
  return flag = true; // first input is a number
}

function checkLength(str){
  if (/\d\d?\d?\d?-\d\d?-\d\d?/g.test(str)){ // input format ####-#(#)-#(#)
      return flag = false;
  }
  return flag = true; // input doesn't include hyphens
}

app.listen(process.env.PORT || 3000, process.env.IP, function(){
  console.log("server is running");
});
