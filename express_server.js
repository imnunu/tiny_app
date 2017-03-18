const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const app = express();
const PORT = process.env.PORT || 8080;
const password = "purple-monkey-dinosaur"; // you will probably this from req.params
const hashed_password = bcrypt.hashSync(password, 10);

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['superpass'],
}))

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
  // let user_id = req.session.user_id;
  // let templateVars = {
  //   urls: urlDatabase,
  //   user: users[user_id]
  // };
  res.render("urls_register");
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
    req.session.user_id = user_id;
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
        req.session.user_id = user_id;
        res.redirect('/');
        return;
      }
    }
    res.status(403).send('Please check your email or password');
});
//TODO here
app.get("/urls", (req, res) => {
  let user_id = req.session.user_id;


  let templateVars = {
    urls: urlDatabase,
    user: users[user_id]
  };
  res.render("urls_index", templateVars);
});


app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let user_ID = req.session.user_id;
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL]['userID'] = user_ID;
  urlDatabase[shortURL]['url'] = req.body.longURL;
  console.log(urlDatabase[shortURL]);
  res.redirect("/urls/" + shortURL);
});

app.get("/urls/new", (req, res) => {
  let user_id = req.session.user_id;
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
  if (user_id === undefined) {
    res.redirect('/login');
  } else {
      let shortURL = req.params.id;
      let longURL = req.body.longURL;
      if (urlDatabase[shortURL]["userID"] === user_id) {
        urlDatabase[shortURL]["url"] = longURL;
        res.redirect('/urls');
      }
    }
  });


app.get("/urls/:id", (req, res) => {
  let user_id = req.session.user_id;
  if (user_id === undefined) {
    res.redirect('/login');
  }
    let shortURL = req.params.id;
    if (urlDatabase[shortURL]["userID"] === user_id) {
      let templateVars = {
        shortURL: shortURL,
        urls: urlDatabase,
        user: users[user_id]
         };
        res.render("urls_show", templateVars);
      }
});

//TODO
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
  let longURL = urlDatabase[req.params.shortURL]['url'];
  res.redirect(longURL);
  }
});

app.post("/logout", (req, res)=> {

  delete req.session.user_id;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
