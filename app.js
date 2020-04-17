const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const redis = require("redis");

// Create client redis
let client = redis.createClient({ port: 6379 });

client.on("error", function(err){
  console.log("Not connected to Redis")
  console.log(err)
})

client.on("connect", function () {
  console.log("Connected to Redis...");
});

//Set port
const port = 3000;

//Init app
const app = express();

//view engine
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//methodOverride
app.use(methodOverride("_method"));

// Search page
app.get("/", function (req, res, next) {
  res.render("searchusers");
});

// Search processing
app.post("/user/search", function (req, res, next) {
  let id = req.body.id;
  client.hgetall(id, function (err, obj) {
    if (!obj) {
      res.render("searchusers", {
        error: "User does not exist",
      });
    } else {
      obj.id = id;
      res.render("details", { user: obj });
    }
  });
});

// Add user page
app.get("/user/add", function (req, res, next) {
  res.render("adduser");
});

// Add user processing
app.post("/user/add", function (req, res, next) {
  let id = req.body.id;
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let email = req.body.email;
  let phone = req.body.phone;

  client.hmset(
    id,
    [
      "first_name",
      first_name,
      "last_name",
      last_name,
      "email",
      email,
      "phone",
      phone,
    ],
    function (err, reply) {
      if (err) {
        console.error(err);
      }
      console.log(reply);
      res.redirect("/");
    }
  );
});

// Delete user processing
app.post("/user/delete/:id", function (req, res, next) {
  let id = req.params.id;
  client.del(id);
  res.redirect("/");
});

app.listen(port, function () {
  console.log(`Server started on port ${port}`);
});
