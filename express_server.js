const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "REcs3j": {
    id: "REcs3j",
    email: "tim@example.com",
    password: "purple-monkey-dinosaur"
  },
 "nd7Hdc": {
    id: "nd7Hdc",
    email: "rey@example.com",
    password: "dishwasher-funk"
  }
};

function generateRandomString() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for(let i = 0; i < 6; i ++ ) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls/register", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_register", templateVars);
});

app.post("/urls/register", (req, res) => {
  let user_id = generateRandomString();
  let user_email = req.body.email;
  let user_password = req.body.password;
  users[user_id] = {};
  users[user_id]['id'] = user_id;
  users[user_id]['email'] = user_email;
  users[user_id]['password'] = user_password;
  users[user_id] = users[user_id];
  console.log(users);
  res.cookie('user_id',user_id);
  res.redirect("/");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls/" + shortURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  // console.log('url is equal to', shortURL);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls/" + shortURL);
});

app.get("/u/:shortURL", (req, res) => {
  // let longURL = ...
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});



app.get("/urls/new", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.post("/login", (req, res)=> {
  let username = req.body.username;
  res.cookie('username',username);
  res.redirect('/urls');
});

app.post("/logout", (req, res)=> {
  let username = req.cookies["username"];
  res.clearCookie("username", username);
  res.redirect('/urls');
});

app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let username = req.cookies["username"];
  res.render("urls_show", {shortURL : shortURL, urls: urlDatabase, username: username});
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
