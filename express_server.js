const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['superpass']
}));

const urlDatabase = {
  "b2xVn2": {
    userID: 'default',
    url: "http://www.lighthouselabs.ca"
  },
  "9sm5xK": {
    userID: 'default',
    url: "http://www.google.com"
  }
};

const users = {
  "REcs3j": {
    id: "REcs3j",
    email: "bilu@example.com",
    password: "purple-monkey-dinosaur"
  },
  id: "nd7Hdc",
  email: "dan@example.com",
  password: "dishwasher-funk"
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
  let user_id = req.session.user_id;
  if (!user_id) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});

app.get("/register", (req, res) => {
  let user_id = req.session.user_id;
  if (user_id) {
    res.redirect('/');
  } else {
    res.render("register");
  }
});


app.post("/register", (req, res) => {
  const user_email = req.body.email;
  const password = req.body.password;
  const hashed_password = bcrypt.hashSync(password, 10);

  if (!user_email || !password) {
    res.status(400).send('Please enter email and password for Registration');
    return;
  } else {
    let user_id = generateRandomString();
    for (let user in users) {
      if (users[user].email === req.body.email) {
        res.status(400).send('This email has been registered, please login.');
        return;
      }
    }
    users[user_id] = {};
    users[user_id]['id'] = user_id;
    users[user_id]['email'] = user_email;
    users[user_id]['password'] = hashed_password;
    console.log(users);
    req.session.user_id = user_id;
    res.redirect("/");
  }
});

app.get('/login', (req, res) => {
  let user_id = req.session.user_id;
  if (!user_id) {
    res.render('login');
  } else {
    res.redirect('/');
  }
});


app.post("/login", (req, res) => {
  const password = req.body.password;
  const hashed_password = bcrypt.hashSync(password, 10);
  let userInputPassword = req.body.password;
  for (let key in users) {
    if ((users[key].email === req.body.email) &&  bcrypt.compareSync(userInputPassword, hashed_password)) {
      const user_id = users[key]["id"];
      req.session.user_id = user_id;
      res.redirect("/");
      return;
    }
  }
  res.status(401).send('Please check your email or password');
});


app.get("/urls", (req, res) => {
  let user_id = req.session.user_id;
  let userDB = {};
  if (!user_id) {
    res.status(401).redirect('/login');
    return;
  }
  for (let key in urlDatabase) {
    if (user_id === urlDatabase[key]["userID"]) {
      userDB[key] = urlDatabase[key];
    }
  }
  let templateVars = {
    urls: userDB,
    user_id: user_id,
    username: users[user_id]
  };
  res.status(200);
  res.render('urls_index', templateVars);

});


app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let user_id = req.session.user_id;
  if (!user_id) {
    res.status(401).redirect('/login');
  } else {
    urlDatabase[shortURL] = {};
    urlDatabase[shortURL]['userID'] = user_id;
    urlDatabase[shortURL]['url'] = req.body.longURL;
    res.redirect("/urls/" + shortURL);
  }
});

app.get("/urls/new", (req, res) => {
  let user_id = req.session.user_id;
  if (!user_id) {
    res.status(401).redirect('/login');
    return;
  } else {
    let templateVars = {
      user_id: user_id,
      users: urlDatabase,
      username: users[user_id]
    };
    res.render("urls_new", templateVars);
  }
});

app.post("/urls/:id/delete", (req, res) => {
  let user_ID = req.session.user_id;
  let shortURL = req.params.id;
  if (urlDatabase[shortURL]['userID'] === user_ID) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.status(403).send("You are not the owner.");
  }
});

app.post("/urls/:id", (req, res) => {
  let user_id = req.session.user_id;
  let shortURL = req.params.id;
  let longURL = req.body.updatedlongURL;
  if (!urlDatabase[shortURL]) {
    res.status(404).send('This URL isn\nt exist');
  } else if (!user_id) {
    res.status(401).redirect('/login');
  } else if (urlDatabase[shortURL]["userID"] === user_id) {
    urlDatabase[shortURL]["url"] = longURL;
    res.redirect("/urls/" + shortURL);
  } else {
    res.status(403).send("Sorry, You are not the owner");
  }
});


app.get("/urls/:id", (req, res) => {
  let user_id = req.session.user_id;
  let shortURL = req.params.id;
  let longURL = req.body.updatedlongURL;
  if (!user_id) {
    res.status(401).redirect('/login');
    return;
  } else if (!urlDatabase[shortURL]) {
    res.status(404).send('this is not valid URL');
  } else if (urlDatabase[shortURL]["userID"] === user_id) {
    let templateVars = {
      loggedUser: req.session.user_id,
      shortURL: shortURL,
      user_id: user_id,
      users: urlDatabase,
      username: users[user_id]
    };
    res.render('urls_show', templateVars);
  } else {
    res.status(403).send('Sorry, you are not the owner');
  }
});



app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    let longURL = urlDatabase[req.params.id]['url'];
    var prefix = 'http://';
    if (longURL.substr(0, prefix.length) !== prefix){
      longURL = prefix + longURL;
    }
    res.redirect(longURL);
  } else {
    res.status(404).send('This url doesn\nt exist');
  }
});


app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let longURL = urlDatabase[req.params.shortURL]['url'];
    var prefix = 'http://';
    if (longURL.substr(0, prefix.length) !== prefix){
      longURL = prefix + longURL;
    }
    res.redirect(longURL);
  }
});

app.post("/logout", (req, res)=> {

  delete req.session.user_id;
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
