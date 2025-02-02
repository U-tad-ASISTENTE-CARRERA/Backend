const bcryptjs = require("bcryptjs")

const encrypt = async (clearPassword) => {
    const hash = await bcryptjs.hash(clearPassword, 10) 
    return hash
}

const compare = async (clearPassword, hashedPassword) => { 
    const result = await bcryptjs.compare(clearPassword, hashedPassword)
    return result
}

module.exports = { encrypt, compare }