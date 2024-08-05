const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require('uuid');
const mailService = require("./mailService");
const tokenService = require("./tokenService");
const UserDto = require("../dto/userDto");
const ApiError = require("../exceptions/apiError");


class UserService {

    async registrations(email, password) {
        const candidate = await UserModel.find({email}); //возвращает массив объектов

        if (candidate.length > 0) {
            throw ApiError.BadRequestError( `User with email ${email} already exists`);
        }
        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuidv4()

        const user = await UserModel.create({email, password: hashPassword, activationLink});
        await mailService.sendActivationEmail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

        const userDto = new UserDto(user);  // id, email, isActivated
        const tokens = tokenService.generateToken({...userDto}) //Оператора спред
        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {...tokens, user: userDto}
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({activationLink})
        if (!user) {
            throw ApiError.BadRequestError(`User with email ${activationLink} does not exist`);
        }
        user.isActive = true;
        await user.save();
    }

    async login(email, password) {
        const user = await UserModel.findOne({email})
        if (!user) {
            throw ApiError.BadRequestError(`User with email ${email} does not exist`);
        }

        const isPassEquals = await bcrypt.compare(password, user.password);
        if (!isPassEquals) {
            throw ApiError.BadRequestError(`Неверный пароль`);
        }
        const userDto = new UserDto(user);  // id, email, isActivated
        const tokens = tokenService.generateToken({...userDto}) //Оператора спред
        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {...tokens, user: userDto}
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = await tokenService.validateRefreshToken(refreshToken);
        const tokenFromDB = await tokenService.findToken(refreshToken);
        if (!userData || !tokenFromDB) {
            throw ApiError.UnauthorizedError();
        }

        const user = await UserModel.findById(userData.id)
        const userDto = new UserDto(user);  // id, email, isActivated
        const tokens = tokenService.generateToken({...userDto}) //Оператора спред
        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {...tokens, user: userDto}
    }

    async getAllUsers() {
        const users = await UserModel.find();
        return users;
    }
}

module.exports = new UserService;