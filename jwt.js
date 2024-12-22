const jwt = require('jsonwebtoken');

SUPER_SECRET_KEY = "12345";

function generateAccessToken(account_id) {
    return jwt.sign(account_id, SUPER_SECRET_KEY, {expiresIn: '180000s'});
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)
    jwt.verify(token, SUPER_SECRET_KEY, (err, user) => {
        // console.log(err)

        if (err) return res.sendStatus(403)

        req.user = user

        next()
    })
}

module.exports = {generateAccessToken, authenticateToken}