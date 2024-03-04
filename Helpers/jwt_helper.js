const JWT = require("jsonwebtoken");
const createError = require("http-errors");
// const { token } = require('morgan')

module.exports = {
  signAccessToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {};

      const secret = process.env.ACCESS_TOKEN;
      const options = {
        expiresIn: "3m",
        issuer: "test.com",
        audience: userId,
      };
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) reject(err);
        resolve(token);
      });
    });
  },
  verifyAccessToken: (req, res, next) => {
    if (!req.headers["authorization"]) {
      return next(createError.Unauthorized());
    }
    const authHeader = req.headers["authorization"];
    const bearerToken = authHeader.split(" ");
    const token = bearerToken[1];
    JWT.verify(token, process.env.ACCESS_TOKEN, (err, payload) => {
      if (err) {
        const message =
          err.name !== "TokenExpiredError" ? "Unauthorized" : err.message;
        return next(createError.BadRequest(message));
      }

      req.payload = payload;
      next();
    });
  },
  checkToken: (token) => {
    console.log(token);
    return new Promise((resolve, reject) => {
      JWT.verify(token, process.env.ACCESS_TOKEN, (err, payload) => {
        if (err) {
          console.log(err.message);
          resolve({ status: false, payload: "" });
        }

        resolve({ status: true, payload: payload });
      });
    });
  },
  signRefreshToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {};

      const secret = process.env.REFRESH_TOKEN;
      const options = {
        expiresIn: "1y",
        issuer: "pickurpage.com",
        audience: userId,
      };
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) reject(err);
        resolve(token);
      });
    });
  },
  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      JWT.verify(refreshToken, process.env.REFRESH_TOKEN, (err, payload) => {
        if (err) return reject(createError.Unauthorized());
        const userId = payload.aud;
        resolve(userId);
      });
    });
  },
};
