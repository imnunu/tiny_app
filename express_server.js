const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": {
    userID: 'xxxxxx',
    url: "http://www.lighthouselabs.ca"
    },
  "9sm5xK": {
    userID: 'yyyyyy',
    url: "http://www.google.com"
    }
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
  let user_id = req.cookies['user_id'];
  let templateVars = {
    urls: urlDatabase,
    user: users[user_id]
  };
  res.render("urls_register", templateVars);
});

//TODO fix the Error: Can't set headers after they are sent.
app.post("/urls/register", (req, res) => {
  const user_email = req.body.email;
  const user_password = req.body.password;

  if (!user_email || !user_password) {
    res.status(403).send('Please enter email and password for Registration');
    return;
  } else {
    let user_id = generateRandomString();
    for (let user in users) {
      if (users[user].email === req.body.email) {
        res.status(403).send('This email has been registered, please login.');
        return;
      }
    }
    users[user_id] = {};
    users[user_id]['id'] = user_id;
    users[user_id]['email'] = user_email;
    users[user_id]['password'] = user_password;
    console.log(users);
    res.cookie('user_id',user_id);
    res.redirect("/");

  }
});

app.get('/urls/login', (req, res) => {
  res.render('urls_login');
});


app.post("/urls/login", (req, res) => {
  let user;
  for (let key in users) {
    if (users[key].email === req.body.email) {
      user = users[key];
      break;
    }
  }
    if (user) {
      if (user.password === req.body.password) {
        res.cookie('user_id', user.id);
        res.redirect('/');
        return;
      }
    }
    res.status(403).send('Please check your email or password');
});

app.get("/urls", (req, res) => {
  let user_id = req.cookies['user_id'];
  let templateVars = {
    urls: urlDatabase,
    user: users[user_id]
  };
  res.render("urls_index", templateVars);
});

//TODO working on this one to add new property into object
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let user_ID = req.cookies['user_id'];
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL]['userID'] = user_ID;
  urlDatabase[shortURL]['url'] = req.body.longURL;
  console.log(urlDatabase[shortURL]);
  res.redirect("/urls/" + shortURL);
});

app.post("/urls/:id/delete", (req, res) => {
  let user_ID = req.cookies['user_id'];
  let shortURL = req.params.id;
  if (urlDatabase[shortURL]['userID'] === user_ID) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.status(403).send("You are not the owner.");
    }
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
//
app.get("/urls/new", (req, res) => {
  let user_id = req.cookies['user_id'];
  if (user_id === undefined) {
    res.redirect('/urls/login');
  } else {
    let templateVars = {
      urls: urlDatabase,
      user: users[user_id]
    };
    res.render("urls_new", templateVars);
  }
});

app.post("/logout", (req, res)=> {
  let user_id = req.cookies["user_id"];
  res.clearCookie("user_id", user_id);
  res.redirect('/urls');
});

app.get("/urls/:id", (req, res) => {
  let user_id = req.cookies['user_id'];
  let shortURL = req.params.id;

  res.render("urls_show", {shortURL : shortURL, urls: urlDatabase, user: users[user_id]});
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
