const expressJwt = require('express-jwt'); // For verifies token
const config = require('./config');
const User = require('./models/user.model')

module.exports = jwt;

function jwt() {
    const secret = config.JWT_SECRET_KEY;
    return expressJwt({ secret, isRevoked }).unless({
        path: [
            // public routes that don't require authentication
            '/api/v1/register',
            '/api/v1/login'
        ]
    });
}

async function isRevoked(req, payload, done) {

    const user = await User.findById(payload.sub);

    // revoke token if user no longer exists
    if (!user) {
        return done(null, true);
    }

    done();
};