const pool = require(".")


const Query = async(text, values) => {
    try {
        const result = await pool.query(text, values)
        return result 
    } catch (error) {
        console.log(error)   
    }
} 

module.exports = Query