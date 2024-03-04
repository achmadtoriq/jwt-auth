const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const Gallery = require("../controllers/gallery");

const prisma = new PrismaClient({ log: ['query', 'info'] });

router.get('/profile', async(req, res) => {
    console.log(req.payload);
    let users = await prisma.user.findMany({
        select:{
            name: true,
            email: true,
            role: true
        }
    })

    const combine = {...users[0], ...req.payload}
    res.json(combine)
})

router.get('/gallery', Gallery)

module.exports = router;