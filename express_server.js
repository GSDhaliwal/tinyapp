const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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
  let templateVars = {  user: users[req.cookies["user_id"]] };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "" || logInAlreadyExists(req.body.email)) {
    res.redirect("/register");
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
  res.redirect("/register");
});

app.get("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    let templateVars = {
      user: users[req.cookies["user_id"]],
      urls: urlsForUser(req.cookies["user_id"])
    };
    res.render("urls_index", templateVars);
  }
  res.redirect("/login");
});

app.post("/urls", (req, res) => {
  const randomShortURLString = generateRandomString();
  if (req.body.longURL) {
    urlDatabase[randomShortURLString] = {
      longURL: req.body.longURL,
      userID: req.cookies["user_id"]
    };
  }
  res.redirect(`/urls/${randomShortURLString}`);
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
  let userID = urlDatabase[shortURL].userID;
  if (req.cookies["user_id"] === userID) {
    let templateVars = {
      user: users[req.cookies["user_id"]],
      shortURL: shortURL,
      longURL: urlDatabase[shortURL].longURL};
    res.render("urls_show", templateVars);
  }
  res.redirect("/login");
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  let userID = urlDatabase[shortURL].userID;
  if (req.cookies["user_id"] === userID)  {
    let shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
  res.redirect("/login");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  let shortURL = req.params.shortURL;
  let userID = urlDatabase[shortURL].userID;
  if (req.cookies["user_id"] === userID)  {
    let shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  }
  res.redirect("/login");
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

const urlsForUser = function(id) {
  let filteredDatabase = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      filteredDatabase[url] = urlDatabase[url];
    }
  }
  return filteredDatabase;
};
