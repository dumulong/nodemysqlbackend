const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const getDb = require("../../db/mysql");

const findOneUser = async (userId) => {
  const db = getDb();
  try {
    const query = `
    SELECT userId, name, email
    FROM users
    WHERE userId = ?;`;
    const users = await db.query(query, [userId]);
    if (users.length < 1) {
      throw new Error("User not found");
    }
    return users[0];
  } catch (error) {
    throw error;
  } finally {
    await db.close();
  }
};

const findByCredentials = async (email, password) => {
  const db = getDb();
  try {
    const query = `
    SELECT userId, name, email, password
    FROM users
    WHERE email = ?;`;

    const users = await db.query(query, [email]);
    if (!users || users.length === 0) {
      throw new Error("Unable to find a user");
    }

    const isMatch = await bcrypt.compare(password, users[0].password);
    if (!isMatch) {
      throw new Error("Unable to find a user with this password");
    }

    const userInfo = { ...users[0] };
    delete userInfo.password; //Do not send the password back...(even hashed)
    return userInfo;
  } catch (error) {
    //Override the error to be less descriptive...
    throw new Error("Unable to login");
  } finally {
    await db.close();
  }
};

const addUser = async (name, email, password) => {
  const db = getDb();

  try {
    //First, hash the password
    const passwordHash = await bcrypt.hash(password, 8);

    // Insert our user
    const query = `
    INSERT INTO users (
    name, email, password
    ) VALUE (?, ?, ?);`;

    const insert = await db.query(query, [name, email, passwordHash]);
    if (insert.affectedRows !== 1) {
      throw new Error("Unable to add a user");
    }

    //Send back the user info
    const user = { userId: insert.insertId, name, email };
    return user;
  } catch (error) {
    throw error;
  } finally {
    await db.close();
  }
};

const updateUser = async (userId, changes) => {
  const db = getDb();

  try {
    // Prepare the update query:
    const fields = Object.keys(changes);
    const values = [];
    for (var i = 0; i < fields.length; i++) {
      const field = fields[i];
      if (field === "password") {
        const passwordHash = await bcrypt.hash(changes[field], 8);
        values.push(passwordHash);
      } else {
        values.push(changes[field]);
      }
    }
    const placeHolders = fields.map((x) => x + " = ?").join(", ");
    const updateQuery = `UPDATE users SET ${placeHolders} WHERE userId = ?;`;

    // Then do the updates
    const update = await db.query(updateQuery, [...values, userId]);

    if (update.affectedRows !== 1) {
      throw new Error("Unable to update a user");
    }

    //Send back the info
    const user = await findOneUser(userId);
    return user;
  } catch (error) {
    throw error;
  } finally {
    await db.close();
  }
};

const deleteUser = async (userId) => {
  const db = getDb();

  try {
    const query = `
    DELETE FROM users
    WHERE userId = ?;`;

    await db.query(query, [userId]);
  } catch (error) {
    throw error;
  } finally {
    await db.close();
  }
};

const generateAuthToken = async (userId) => {
  const data = { userId: userId.toString() };
  const secret = process.env.JWT_SECRET;
  const options = { expiresIn: process.env.JWT_EXPIRE || "1d" };

  const token = jwt.sign(data, secret, options);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const idToken = {
    token,
    iat: decoded.iat,
    exp: decoded.exp,
    expiresIn: decoded.exp - decoded.iat,
  };

  return idToken;
};

const findOneToken = async (userId, token) => {
  const db = getDb();
  try {
    const query = `
    SELECT tokenId, userId, token
    FROM users_tokens
    WHERE userId = ? AND token = ?;`;
    const userTokens = await db.query(query, [userId, token]);
    if (userTokens.length < 1) {
      throw new Error("User Token not found");
    }
    return userTokens[0];
  } catch (error) {
    throw error;
  } finally {
    await db.close();
  }
};

const addToken = async (userId) => {
  const db = getDb();

  try {
    const idToken = await generateAuthToken(userId);
    const query = `
    INSERT INTO users_tokens (
    userId, token, exp
    ) VALUE (?, ?, ?);`;
    const token = await db.query(query, [userId, idToken.token, idToken.exp]);
    if (token.affectedRows !== 1) {
      throw new Error("Unable to add a token");
    }

    return idToken;
  } catch (error) {
    throw error;
  } finally {
    await db.close();
  }
};

const removeToken = async (userId, token) => {
  const db = getDb();
  try {
    const query = `
    DELETE FROM users_tokens
    WHERE userId = ? AND token = ?;`;
    const deleteRec = await db.query(query, [userId, token]);
    return deleteRec.affectedRows;
  } catch (error) {
    throw error;
  } finally {
    await db.close();
  }
};

const removeAllTokens = async (userId) => {
  const db = getDb();
  try {
    const query = `
    DELETE FROM users_tokens
    WHERE userId = ?;`;
    const deleteRec = await db.query(query, [userId]);
    return deleteRec.affectedRows;
  } catch (error) {
    throw error;
  } finally {
    await db.close();
  }
};

module.exports = {
  generateAuthToken,
  findOneUser,
  findByCredentials,
  addUser,
  updateUser,
  deleteUser,
  findOneToken,
  addToken,
  removeToken,
  removeAllTokens,
};
