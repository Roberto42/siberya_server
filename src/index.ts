import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes';
import mongoose from 'mongoose';

mongoose.set('strictQuery', true);
mongoose.connect(`mongodb://${process.env.DB_URL}:${process.env.DB_PORT}/${process.env.DB_NAME}`)
  .then(()=>{
    const app = express();
    const port = process.env.PORT as number | undefined;
    app.use(express.json());
    app.use(cors());
    app.use(routes);
    app.listen(port, ()=>{ console.log(`Server online at ${process.env.BASEURL}:${port}`) });
  })
  .catch((error)=>{ console.log(`Server is down! ${error}`);
  });