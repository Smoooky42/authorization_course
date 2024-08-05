const ApiError = require('../exceptions/apiError');
const tokenService = require('../services/tokenService');

module.exports = async function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return next(ApiError.UnauthorizedError())
        }
        const accessToken = authorizationHeader.split(' ')[1];
        if (!accessToken) {
            return next(ApiError.UnauthorizedError())
        }
        const userData = await tokenService.validateAccessToken(accessToken);
        console.log(userData)

        if (!userData) {
            return next(ApiError.UnauthorizedError())
        }
        req.user = userData;
        next();

    } catch (e) {
        return next(ApiError.UnauthorizedError())
    }
}