import userRouter from "../modules/user";
import uploadRouter from "../modules/upload"
import express from 'express'

const app = express();
app.use(express.json());

app.use('/api/v1/user', userRouter);
app.use('/api/v1/upload', uploadRouter)

app.listen(3000, () => console.log('Server running on port 3000'));