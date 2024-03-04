const bcrypt = require("bcrypt");
const Query = require("./BuildQuery");
const { v4: uuidv4 } = require("uuid");
const uuid = uuidv4();

const TABLE_NAME = "User";

const findUser = async (request) => {
  try {
    const text = `SELECT * FROM ${TABLE_NAME} WHERE email = $1`;
    const values = [request.email];

    const result = await Query(text, values);
    return result;
  } catch (error) {
    console.log(error);
  }
};

const saveUser = async (request) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(request.password, salt);

    request.user_uuid = uuid;
    request.password = hashedPassword;

    const text = `INSERT INTO ${TABLE_NAME} (name, email, password) VALUES ($1, $2, $3)`;
    const values = [
      request.name,
      request.email,
      request.password,
    ];

    const result = await Query(text, values);
    if (result.rowCount === 1) {
      return uuid;
    } else {
      console.log("Failed to create a record");
    }
  } catch (error) {
    console.log(error);
  }
};

const isValidPassword = async(data, request) => {
  try {
    return await bcrypt.compare(request.password, data.user_password);
  } catch (error) {
    throw error;
  }
};

module.exports = { findUser, saveUser, isValidPassword };
