import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from "../config/config";

export interface AuthenticatedRequest extends Request{
    userId?: String
}

export const  authMiddleware = (req:AuthenticatedRequest,res:Response,next:NextFunction) => {
        try {
            const authHeader = req.headers['authorization']

            if(!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(403).json({ message: "no token provided or invalid format" })
            }

            const token = authHeader.split(' ')[1]

            const decoded = jwt.verify(token, JWT_SECRET) as {userId: string}

            req.userId = decoded.userId
            next()
        } catch (error) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
}

export default authMiddleware;