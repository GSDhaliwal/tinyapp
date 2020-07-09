const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]], users: users};
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "" || logInAlreadyExists(req.body.email)) {
    res.send(400);
  } else {
    const randomGeneratedID = generateRandomString();
    users[randomGeneratedID] = {};
    users[randomGeneratedID].id = randomGeneratedID;
    users[randomGeneratedID].email = req.body["email"];
    users[randomGeneratedID].password = req.body["password"];
    res.cookie("user_id", randomGeneratedID);
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]], users: users};
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  for (const user in users) {
    if (req.body.email === users[user].email) {
      if (req.body.password === users[user].password) {
        res.cookie("user_id", user);
        res.redirect("/urls");
        return;
      }
    }
  }
  res.send(403);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    if (req.cookies["user_id"]) {
      let templateVars = { user: users[req.cookies["user_id"]] };
      res.render("urls_new", templateVars);
      return;
    }
  res.redirect("/login");
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let templateVars = { user: users[req.cookies["user_id"]], shortURL: shortURL, longURL: urlDatabase[shortURL]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const randomShortURLString = generateRandomString();
  if (req.body.longURL) {
    urlDatabase[randomShortURLString] = req.body.longURL;
  }
  res.redirect(`/urls/${randomShortURLString}`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = function() {
  let randomlyGeneratedString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let iterations = 0; iterations < 6; iterations++) {
    randomlyGeneratedString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomlyGeneratedString;
};

const logInAlreadyExists = function(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
};
