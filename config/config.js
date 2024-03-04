require('dotenv').config()

const data_env = {
    development: {
        username: process.env.DB_PG_DEV_USER,
        password: process.env.DB_PG_DEV_PASSWORD,
        database: process.env.DB_PG_DEV_DATABASE,
        host: process.env.DB_PG_DEV_HOST,
        dialect: process.env.DB_PG_DEV_MODUL
    }
}

module.exports = data_env