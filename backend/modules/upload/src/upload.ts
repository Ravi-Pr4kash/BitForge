import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Request, RequestHandler, Router } from 'express'
import { Prisma } from '../../../prisma/generated/prisma/client';
import authMiddleware, { AuthenticatedRequest } from '../../user/src/middleware/authMiddleware';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { prisma } from '../../../src/lib/prisma';


const router = Router();


const s3Client = new S3Client({
    region: "auto",
    endpoint:  `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
    },
})



const getUploadUrl: RequestHandler = async (req, res) => {
    try { const authReq = req as AuthenticatedRequest
        const { fileName, contentType, title } = authReq.body
        const userId = authReq.userId

        if(!fileName || !contentType) {
                return res.status(400).json({ message: "fileName and contentType are required" })
            }

            //Define the storage path (key)
            const fileKey = `upload/raw/${userId}/${Date.now()}-${fileName}`

            //Generate the Presigned URL for direct upload to R2
            const command = new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: fileKey,
                ContentType: contentType
            })

            const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900,
                signableHeaders: new Set(['host', 'content-type']), })

            //Create the video record in the database
            const videoRecord = await prisma.video.create({
                data: {
                    title: title || fileName,
                    rawURL: fileKey,
                    status: false,
                    userId: Number(userId)
                }
            })

            //Return details

            return res.status(200).json({
                message: "Upload Initialised",
                uploadUrl: uploadUrl,
                videoId: videoRecord.id,
                key: fileKey
            })
           }   catch (error) {
            console.error("UPLOAD ERROR:", error)
        return res.status(500).json({ message: "Error initializing upload" });
    }
}


router.post('/get-upload-url',authMiddleware, getUploadUrl)



export default router;