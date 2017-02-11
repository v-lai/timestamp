var express = require("express");
var app = express();

app.get('/', function(req, res){
  res.send('hello world');
});

app.listen(3000, process.env.IP, function(){
  console.log("server is running");
});
