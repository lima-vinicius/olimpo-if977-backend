import bcrypt from 'bcryptjs';
import * as jwt from '../utils/jwt';

import { PrismaClient } from '@prisma/client';
import createHttpError from 'http-errors';
import { error } from 'console';
import { NotFoundError } from '@prisma/client/runtime';
const prisma = new PrismaClient();

require('dotenv').config();

class UniversityService {
    static register = async (data: any) => {

        try {

            const { email } = data;

            const find = await prisma.universityUser.findUnique({
                where: {
                    email: data.email
                }
            })
            if (find == undefined) {
                data.password = bcrypt.hashSync(data.password, 8);

                const university = prisma.universityUser.create({
                    data
                }).finally(async () => await prisma.$disconnect())

                const accessToken = await jwt.default.signAccessToken(university)

                return { data, accessToken }

            }
            else if (find != undefined) {
                return "University user yet exist, try again."
            }
        }
        catch (e) {
            return e
        }
    }

    static login = async (data: any) => {

        try{
            const {email, password} = data;

        const user = await prisma.universityUser.findUnique({
            where:{
                email
            }
        });

        if(!user){
            throw Object.assign(new Error('Usuário não encontrado'), { status: 404})
        }
        const checkPassword = bcrypt.compareSync(password, user.password)
        if(!checkPassword) throw Object.assign(new Error('Email ou senha inválido'), { status: 401 })
        delete user.password
        const accessToken = await jwt.default.signAccessToken(user)

        return {accessToken}
        }
        catch(e){
            return e
        }     
    }

}


export default UniversityService;