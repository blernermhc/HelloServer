// Parses the URL to return a different result based on the language
// Also serves html and javascript files

// Load the necessary modules
var http = require('http');
var url = require('url');
const fs = require('fs');

// Create the server, telling it the name of the function to call
// when a request arrives.
var server = http.createServer(handleRequest);

// Get it listening to port 8080.
server.listen(8080);

// This is called whenever a request arrives at the server.
// req contains the request.
// res is the object that will contain the response.
function handleRequest (req, res) {
  if (req.method == "GET") {
    handleGetRequest (req, res);
  }
  else if (req.method == "POST") {
    handlePostRequest (req, res);
  }
}

// Respond to requests sent with GET
function handleGetRequest (req, res) {
  // Parse the query.
  console.log(req.url);
  parsedURL = url.parse(req.url, true);
  var q = parsedURL.query;
  console.log (q);
  var path = parsedURL.pathname;
  console.log (path);

  // Check if this is using the hello "command"
  if (path == "/hello") {
      handleHello (parsedURL.query.lang, res);
  }

  // Otherwise serve the requested file
  else {
      serveFile (path, res);
  }
}

// Responds to hello requests when sent with POST
function handlePostRequest (req, res) {
  console.log ("In handlePostRequest");

  // Make sure the desired action is hello
  if (req.url == "/hello") {
    console.log ("Found /hello");
    var requestBody;

    // Get the data from the request
    req.on ('data', function (data) {
      requestBody = data;
      console.log ("data = " + data);
    });

    // Parse the data to find out the language and
    // respond accordingly.
    req.on ('end', function () {
      langData = JSON.parse(requestBody);
      lang = langData.lang;
      console.log ("lang = " + lang);
      handleHello (lang, res);
    });
  }
}

// Look at the query string to determine how to say hello
// and return hello in that language
function handleHello (lang, res) {
    console.log ("In handleHello");
    res.writeHead(200, {'Content-Type': 'text/html'});

    // Hard-coded in the translation here for demo simplicity instead
    // of looking it up in the database.  See other examples for how to
    // do the DB lookup.
    if (lang == "english") {
        res.end("Hello");
    }
    else if (lang == "french") {
        res.end("Bonjour");
    }
    else if (lang == "chinese") {
        res.end("Nihao");
    }
    else {
        res.end ("Don't know how to say hello in " + lang);
    }
}

// Returns the contents of the requested file to the client
function serveFile (path, res) {
  // If no file name is provided, use index.html
  if (path == "/") {
     path = "/index.html";
  }

  // Build the full path to the file.  __dirname is where the server code
  // is located
  var filepath = __dirname + path;
  console.log(filepath);

  // Check if the file exists and execute the corresponding function
  fs.stat(filepath, function (err, stat) {
      if (err == null) {
          // Serve an html file
          if (filepath.endsWith (".html")) {
              // Initialize the response to be html
              res.writeHead(200, {'Content-Type': 'text/html'});
	      fs.createReadStream(filepath).pipe(res)
	  }

          // Serve a javascript file
	  else if (filepath.endsWith (".js")) {
              // Initialize the response to be html
              res.writeHead(200, {'Content-Type': 'application/javascript'});
	      fs.createReadStream(filepath).pipe(res)
	  }

          // Some other file type we don't know how to deal with
	  else {
	      console.log ("Don't know how to serve " + path);
	  }
      }
      else {
          // Display the error in the console so the server doesn't crash
          console.log(err);
      }
  });
}

