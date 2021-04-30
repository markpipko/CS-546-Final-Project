const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const saltRounds = 16;
const data = require("../data");
//const { userMetrics } = require('../config/mongoCollections'); Do we need this?
const users = data.users;
const userMetrics = data.userMetrics;

router.get('/', async (req, res) => {
    res.render("login", { title: "Login" });
});

router.post('/', async (req, res) => {
    res.redirect("/login");
});

router.get("/signup", async (req, res) => {
  res.render("signup", { title: "Sign Up" });
});

router.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password, age, cash } = req.body;
  const hash = await bcrypt.hash(password, saltRounds);
  let user = await users.addUser(firstName, lastName, email, parseInt(age), hash, Number(cash), []);
  let userMetrics = await userMetrics.create(email, 0, 0, 0)
  req.session.user = { email: email };
  res.redirect("/private");
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  let allUsers = await users.getAllUsers();
  let match = false;

  for (let i = 0; i < allUsers.length; i++) {
    if (email == allUsers[i].email) {
      match = await bcrypt.compare(password, allUsers[i].password);
      if (match) {
        req.session.user = { email: req.body.email, firstName: allUsers[i].firstName, stocksPurchased: allUsers[i].stocksPurchased };
        res.redirect('/private');
      }
      break;
    }
  }

  if (!match) {
    res.render("login", { title: "Login", hasErrors: true, error: "Invalid Login" });
  }
  
});

router.get('/logout', async (req, res) => {
  req.session.destroy();
  res.send('Logged out');
});

module.exports = router;