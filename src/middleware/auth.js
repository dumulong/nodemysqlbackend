const jwt = require("jsonwebtoken");
const userUtil = require("../db/utils/user");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    // Please note that verify will throw an error if token expired!
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userToken = await userUtil.findOneToken( decoded.userId, token);
    const user = await userUtil.findOneUser( userToken.userId);
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate." });
  }
};

module.exports = auth;
