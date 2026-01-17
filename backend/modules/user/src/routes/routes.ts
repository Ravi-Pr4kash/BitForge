import { Router } from "express";
import bcrypt from 'bcrypt'
import { prisma } from "../../../../src/lib/prisma";
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from "../config/config";
import { log } from "console";

const router = Router();


router.post('/signup', async(req,res) => {
    try {
        const { name, email, password } = req.body;
        if(!email && !password) {
            return res.status(400).json({ message: "email or password is missing" })
        }

        const checkUser = await prisma.user.findUnique({where: {email:email}})
        if(checkUser) return res.status(409).json({ message: "email already exists" })

        const hashedPassword = await bcrypt.hash(password,10)

        const user = await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword
            }
        })

        return res.status(201).json({ 
            message: `Welcome ${name}` })
    } catch (error: any) {
            return res.status(500).json({ message: "Internal server error" })
    }
})


router.post('/signin', async(req,res) => {
    try {
        const { email, password } = req.body;
        if(!email && !password) return res.status(400).json({ message: `email and password required` })
            
        
        const user = await prisma.user.findFirst({
            where: {
                email: email,
            }
        })    

        if(!user) {
            return res.status(401).json({ message: "invalid email or password" })
        }

        const isPass = await bcrypt.compare(password, user.password)
        if (!isPass) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET)

        return res.status(200).json({
            message: `Welcome ${user.name}`,
            userId: user.id,
            token: token
        })
    } catch (error: any) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" });
    }
})


export default router;