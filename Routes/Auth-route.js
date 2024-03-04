const express = require("express");
const moment = require("moment");
const router = express.Router();
const createError = require("http-errors");
const { addAuthSchema, LoginSchema } = require("../Helpers/validation_schema");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  checkToken,
  verifyAccessToken,
} = require("../Helpers/jwt_helper");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({ log: ["query", "info"] });

router.post("/register", async (req, res, next) => {
  try {
    const result = await addAuthSchema.validateAsync(req.body);

    const exist = await prisma.user.findUnique({
      where: {
        email: result.email,
      },
    });

    if (exist)
      throw createError.Conflict(`${result.email} is already been registered`);

    // const uuid = await saveUser(result)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(result.password, salt);
    const user = await prisma.user.create({
      data: {
        name: result.name,
        email: result.email,
        password: hashedPassword,
        role: result.role,
      },
    });

    const accessToken = await signAccessToken(user.id);
    const refreshToken = await signRefreshToken(user.id);

    res.send({ accessToken, refreshToken });
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const result = await LoginSchema.validateAsync(req.body);
    const user = await prisma.user.findUnique({
      where: {
        email: result.email,
      },
    });

    console.log(user);
    if (!user) throw createError.NotFound(`User not registered`);

    const isMatch = await bcrypt.compare(result.password, user.password);

    if (!isMatch) throw createError(404, "Username/Password not Valid");

    // const verifyToken = await checkToken(chkSession.sessionToken);

    let accessToken = await signAccessToken(user.id);
    let refreshToken = await signRefreshToken(user.id);

    /* check save session db */
    const chkSession = await prisma.session.findFirst({
      where: {
        userId: user.id,
        isExpired: 0,
      },
    });

    console.log("next");
    console.log(chkSession);

    let chkToken = {};
    if (!chkSession) {
      console.log("jika kosong");
      // save session
      const session = await prisma.session.create({
        data: {
          sessionToken: accessToken,
          userId: user.id,
          isExpired: 0,
          refreshToken: refreshToken,
        },
      });
      console.log(session);

      /* Check Token */
      chkToken = await checkToken(session.sessionToken);
      console.log(chkToken);
    } else {
      console.log("jika ada");

      /* Check Token */
      chkToken = await checkToken(chkSession.sessionToken);
      console.log(chkToken);

      if (!chkToken.status) {
        console.log("sudah expired");

        /* Update Expired Session */
        await prisma.session.update({
          data: {
            isExpired: 1,
          },
          where: {
            userId: chkSession.userId,
            sessionToken: chkSession.sessionToken,
            refreshToken: chkSession.refreshToken,
          },
        });

        /* create store session again */
        accessToken = await signAccessToken(user.id);
        refreshToken = await signRefreshToken(user.id);
        console.log("GJHJ");
        console.log(accessToken);

        const sessionNew = await prisma.session.create({
          data: {
            sessionToken: accessToken,
            userId: user.id,
            isExpired: 0,
            refreshToken: refreshToken,
          },
        });

        console.log("create token again ");
        console.log(sessionNew);

        /* Check Token */
        chkToken = await checkToken(accessToken);
        console.log(chkToken);
      }
    }

    const date = moment.unix(chkToken.payload.exp);
    console.log(date.format("YYYY-MM-DD HH:mm:ss"));

    res.send({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      exp: chkToken.payload.exp,
      iat: chkToken.payload.iat,
      exp_date: moment.unix(chkToken.payload.exp).format("YYYY-MM-DD HH:mm:ss"),
      iat_date: moment.unix(chkToken.payload.iat).format("YYYY-MM-DD HH:mm:ss"),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.log(error);
    if (error.isJoi === true)
      return next(createError.BadRequest(error.message));
    next(error);
  }
});

router.post("/refresh-token", async (req, res, next) => {
  try {
    const { refreshToken } = req.body

    console.log(refreshToken);
    if (!refreshToken) throw createError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);

    const accessToken = await signAccessToken(userId);
    const refToken = await signRefreshToken(userId);

    res.send({ success: true, accessToken: accessToken, refToken: refToken });
  } catch (error) {
    next(error);
  }
});

router.post("/verify-token", async (req, res, next) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) throw createError.BadRequest();
    /* Check Token */
    const chkToken = await verifyAccessToken(accessToken);

    const msg = chkToken.message;
    if(chkToken.status != 200) throw createError(404, msg)

    res.json(chkToken);
  } catch (error) {
    next(error)
  }
});

router.delete("/logout", async (req, res, next) => {
  res.json({ status: 200, message: "Success Logout"});
});

module.exports = router;
