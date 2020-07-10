const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
//const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
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
app.use(cookieSession({
  name: 'session',
  keys: ["purplepricklypineapples"]
}))
//app.use(cookieParser());

// starting server codes
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


// Register
app.get("/register", (req, res) => {
  let templateVars = {  user: users[req.session.user_id] };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "" || getUserByEmail(req.body.email, users)) {
    console.log(req.body);
    res.redirect("/error");
  } else {
    const randomGeneratedID = generateRandomString();
    const hashedPassword = bcrypt.hashSync(req.body["password"], 10);
    users[randomGeneratedID] = {};
    users[randomGeneratedID].id = randomGeneratedID;
    users[randomGeneratedID].email = req.body["email"];
    users[randomGeneratedID].password = hashedPassword;
    req.session.user_id = randomGeneratedID;
    res.redirect("/urls");
  }
});


// Login
app.get("/login", (req, res) => {
  let templateVars = { user: users[req.session.user_id], users: users};
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  for (const user in users) {
    if (req.body.email === users[user].email) {
      const hashedPassword = bcrypt.hashSync(req.body.password, 10);
      if (bcrypt.compareSync(req.body.password, hashedPassword)) {
        console.log(users)
        req.session.user_id = user;
        res.redirect("/urls");
        return;
      }
    }
  }
  res.redirect("/error");
});


// Logout request
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
});


//Error
app.get("/error", (req, res) => {
  let templateVars = {  user: users[req.session.user_id] };
  res.render("error", templateVars);
});


//Main URL Page
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    let templateVars = {
      user: users[req.session.user_id],
      urls: urlsForUser(req.session.user_id)
    };
    res.render("urls_index", templateVars);
  }
  res.redirect("/error");
});


//Testing URL Database
app.post("/urls", (req, res) => {
  const randomShortURLString = generateRandomString();
  if (req.body.longURL) {
    urlDatabase[randomShortURLString] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
  }
  res.redirect(`/urls/${randomShortURLString}`);
});


//URL Edit and Delete Features
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  let userID = urlDatabase[shortURL].userID;
  if (req.session.user_id === userID) {
    let shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
  res.redirect("/error");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  let shortURL = req.params.shortURL;
  let userID = urlDatabase[shortURL].userID;
  if (req.session.user_id === userID)  {
    let shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  }
    res.redirect("/error");
});


//Creat New URL
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    let templateVars = { user: users[req.session.user_id] };
    res.render("urls_new", templateVars);
    return;
  }
  res.redirect("/login");
});


//Short URL Params
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let userID = urlDatabase[shortURL].userID;
  if (req.session.user_id === userID) {
    let templateVars = {
      user: users[req.session.user_id],
      shortURL: shortURL,
      longURL: urlDatabase[shortURL].longURL};
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/error");
  }
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
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

const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (users[user].email === email) {
      return user;
    } else {
      return undefined;
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

module.exports = { getUserByEmail }