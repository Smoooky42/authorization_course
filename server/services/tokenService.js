const jwt = require("jsonwebtoken");
const tokenModel = require("../models/tokenModel");

class TokenService {
    generateToken(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET_KEY, { expiresIn: '15s' });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: '30d' });

        return {
            accessToken,
            refreshToken
        }
    }

    async saveToken(userId, refreshToken) {
        const tokenData = await tokenModel.findOne({user: userId}); //возвращает null или {}

        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save()
        }
        const token = await tokenModel.create({user: userId, refreshToken})
        return token
    }

    async removeToken(refreshToken){
        const tokenData = await tokenModel.deleteOne({refreshToken});
        return tokenData;
    }

    async validateAccessToken(accesstoken) {
        try {
            const userData = jwt.verify(accesstoken, process.env.JWT_ACCESS_SECRET_KEY)
            return userData;
        } catch (e) {
            return null
        }
    }

    async validateRefreshToken(refreshtoken) {
        try {
            const userData = jwt.verify(refreshtoken, process.env.JWT_REFRESH_SECRET_KEY)
            return userData;
        } catch (e) {
            return null
        }
    }

    async findToken(refreshToken){
        const tokenData = await tokenModel.findOne({refreshToken});
        return tokenData;
    }
}

module.exports = new TokenService;