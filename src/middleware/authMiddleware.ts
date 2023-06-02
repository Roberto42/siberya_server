import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import User from '../entities/User';

type JwtPayload = {
  id: string;
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  if(!authorization)
      return res.status(401).json({msg: 'Não autorizado!'});

  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.SECRET_JWT ?? '', (async (err: any, result: any) => {
          if (err) {
              return res.status(401).json({ msg: 'Não autorizado/Token expirado' });
          } else {             
              const user = await User.findById({ _id: result.id, access: result.access });
              if (!user)
                  return res.status(401).json({ msg: 'Não autorizado!' });

              req.user = user;
              next();
          }
      })
  );     
};