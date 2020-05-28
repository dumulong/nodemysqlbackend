const express = require("express");
const auth = require("../middleware/auth");
const HTTPError = require("../models/http-error");

const userUtil = require("../db/utils/user");
const router = new express.Router();

// Create a new user (register)
router.post("/users", async (req, res) => {

  try {
    // We need to insert a user (hashed the password).
    const user = await userUtil.addUser(req.body.name, req.body.email, req.body.password);
    // Then we need to add a token and save it to the users_tokens table
    const idToken = await userUtil.addToken(user.userId);
    res.status(201).send({ user, idToken });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Login user
router.post("/users/login", async (req, res) => {

  try {
    const user = await userUtil.findByCredentials(req.body.email, req.body.password)
    const idToken = await userUtil.addToken(user.userId);
    res.send({ user, idToken });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Logout user (me only)
router.post("/users/logout", auth, async (req, res) => {
  try {
    const deleteCount = await userUtil.removeToken(req.user.userId, req.token);
    res.send( {"tokens_removed" : deleteCount} );
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Log out user (me only) and remove all tokens
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    const deleteCount = await userUtil.removeAllTokens(req.user.userId);
    res.send( {"tokens_removed" : deleteCount} );
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get user's profile (me only)
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

// Update a user (me only)
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password"];

  try {
    const idValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!idValidOperation) {
      throw new HTTPError(400, "Invalid updates!");
    }
    updates.forEach((update) => (req.user[update] = req.body[update]));
    const user = await userUtil.updateUser(req.user.userId, req.body);
    res.send(user);
  } catch (error) {
    let httpCode = error.httpCode || 500;
    res.status(httpCode).send({ error: error.message });
  }
});

// Delete a user (me only)
router.delete("/users/me", auth, async (req, res) => {
  try {
    await userUtil.removeAllTokens(req.user.userId);
    await userUtil.deleteUser (req.user.userId);
    res.send(req.user);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
