const createHttpError = require("http-errors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { prisma } = require("../config/database");

const register = async (req, res, next) => {
    try {

        const { name, phone, email, password, role } = req.body;

        if(!name || !phone || !email || !password || !role){
            const error = createHttpError(400, "All fields are required!");
            return next(error);
        }

        const isUserPresent = await prisma.user.findUnique({where: {email}});
        if(isUserPresent){
            const error = createHttpError(400, "User already exist!");
            return next(error);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await prisma.user.create({
            data: {
                name,
                phone,
                email,
                password: hashedPassword,
                role
            }
        });

        res.status(201).json({success: true, message: "New user created!", data: newUser});

    } catch (error) {
        next(error);
    }
}


const login = async (req, res, next) => {

    try {

        const { email, password } = req.body;

        if(!email || !password) {
            const error = createHttpError(400, "All fields are required!");
            return next(error);
        }

        const isUserPresent = await prisma.user.findUnique({where: {email}});
        if(!isUserPresent){
            const error = createHttpError(401, "Invalid Credentials");
            return next(error);
        }

        const isMatch = await bcrypt.compare(password, isUserPresent.password);
        if(!isMatch){
            const error = createHttpError(401, "Invalid Credentials");
            return next(error);
        }

        const accessToken = jwt.sign({id: isUserPresent.id}, config.accessTokenSecret, {
            expiresIn : '1d'
        });

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 *24 * 30,
            httpOnly: true,
            sameSite: 'none',
            secure: true
        })

        res.status(200).json({success: true, message: "User login successfully!",
            data: isUserPresent
        });

    } catch (error) {
        next(error);
    }

}

const getUserData = async (req, res, next) => {
    try {

        const user = await prisma.user.findUnique({where: {id: req.user.id}});
        res.status(200).json({success: true, data: user});

    } catch (error) {
        next(error);
    }
}

const logout = async (req, res, next) => {
    try {

        res.clearCookie('accessToken');
        res.status(200).json({success: true, message: "User logout successfully!"});

    } catch (error) {
        next(error);
    }
}




module.exports = { register, login, getUserData, logout }
