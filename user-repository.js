import crypto from "node:crypto"
import bcrypt from "bcrypt"

import DBLocal from "db-local"
const { Schema } = new DBLocal({ path: "./db" })

import { SALT_ROUNDS } from "./config.js"


const User = Schema("User", {
    _id: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true }
})

export class UserRepository {
    static async create({ username, password }) {
        Validate.username(username)
        Validate.password(password)


        const user = User.findOne({ username })
        if (user) throw new Error("username already exists")

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)


        const id = crypto.randomUUID()

        User.create({
            _id: id,
            username,
            password: hashedPassword
        }).save()

        return id;
    }
    static async login({ username, password }) {
        Validate.username(username)
        Validate.password(password)

        const user = User.findOne({ username })
        if (!user) throw new Error("username does not exists")

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) throw new Error("password is invalid")

        const { password: _, ...publicUser } = user;

        return publicUser;
    }
}


class Validate {
    static username(username) {
        if (typeof username != "string") throw new Error("username must be a string")
        if (username.length < 3) throw new Error("username must be at least 3 characters long")
    }
    static password(password) {
        if (typeof password != "string") throw new Error("password must be a string")
        if (password.length < 6) throw new Error("password must be at least 6 characters long")
    }
}