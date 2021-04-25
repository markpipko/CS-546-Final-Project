const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

router.get('/', async (req, res) => {
    res.render("login", { title: "Login" });
});

router.post('/', async (req, res) => {
    res.redirect("/login");
});

router.post('/login', async (req, res) => {
  /*get req.body username and password
	const { username, password } = req.body;
	here, you would get the user from the db based on the username, then you would read the hashed pw
	and then compare it to the pw in the req.body
	let match = bcrypt.compare(password, 'HASHED_PW_FROM DB');
	if they match then set req.session.user and then redirect them to the login page
	 I will just do that here */
  req.session.user = { email: req.body.email }; //TODO: include password and clear cookie data?
  res.redirect('/private');
});

router.get('/logout', async (req, res) => {
  req.session.destroy();
  res.send('Logged out');
});

module.exports = router;