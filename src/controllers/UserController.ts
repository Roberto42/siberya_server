import { Request, Response } from "express";
import User from "../entities/User";
import jwt from "jsonwebtoken";
import "dotenv/config";

export function generateToken(params={}){
  return jwt.sign( params, process.env.SECRET_JWT || '', {
    expiresIn: 86400,
  })
}

export class UserController{
  async create(req: Request, res: Response){
    const data = req.body;

    if(await User.findOne({document: data.document}))
      res.status(400).json({msg: 'Usuário já cadastrado!'});
    if(await User.findOne({mobile: data.mobile}))
      res.status(400).json({msg: 'Celular já cadastrado!'});
    if(await User.findOne({email: data.email}))
      res.status(400).json({msg: 'Email já em uso!'});
    if(await User.findOne({user: data.user}))
      res.status(400).json({msg: 'Nome de usuário já em uso! Cadastre outro!'});
    
    try {      
      const newUser = await User.create(data);
      res.status(201).json({id: newUser.id, token: generateToken({id: newUser.id, access: newUser.access})});
    } catch (error) {
      res.status(400).json({msg: `Não foi possível cadastrar o usuário!${error}`});
    }
  };

  async profile(req: Request, res: Response){
    res.status(200).json(req.user);
  };

  async showUser(req: Request, res: Response){
    const user_id = req.params?.id;

    if(!user_id)
      res.status(400).json({msg: 'Informe id do usuário!'});

    try{
      const user = await User.findById({_id: user_id});
      res.status(200).json(user);
    } catch(error){
      res.status(500).json({msg: `Não foi possível acessar serviço! ${error}`});
    }
  };

  async listUser(req: Request, res: Response){
    let page  = parseInt(req.query.page as string || '1');
    let limit = parseInt(req.query.limit as string || '10');
    let skip  = limit * (page - 1);
    let query = {};
    let sort  = {};

    query = { $and:[{ deleted:{$ne: true} }] };
    sort ={ 'name': 1 };

    if(req.query.name){
      query = { $and:[{ name: RegExp((req.query.name as string), 'i'),  deleted:{$ne: true} }] };
      sort  = { 'name': 1 };
    }
    if(req.query.document){
      query = { $and:[{ document: RegExp((req.query.document as string), 'i'), deleted:{$ne: true} }] };
      sort  = { 'document': 1 };
    }
    if(req.query.mobile){
      query = { $and:[{ mobile: RegExp((req.query.mobile as string), 'i'), deleted:{$ne: true} }]};
      sort  = { 'mobile': 1 };
    }

    try{
      const users = await User.find(query).skip(skip).limit(limit).sort(sort);
        if(!users) return res.status(400).json({msg: 'Nenhum registro encontrado!'});
      return res.status(200).json(users);
    } catch (error){
      return res.status(500).json({msg: `Internal server error! ${error}`});
    };
  };
  
  async updateUser(req: Request, res: Response){
    const user_id = req.params?.id;
    const data = req.body;
    const {access, user, pass: _, ...newData} = data;

    if(!user_id) return res.status(400).json({msg: 'Informe um usuários!'});
    if(req.body.length === 0) return res.status(400).json({msg: 'Requisição vazia!'});

    try {
      newData.updated_at = Date.now();
      await User.findOneAndUpdate({_id: user_id}, { $set: newData }, { new: true })
        .then((result)=>{        
          return res.status(200).json({msg: 'Usuário atualizado com sucesso!', user: result});
        })
        .catch((error)=>{
          return res.status(400).json({msg: `Não foi possível atualizar usuários! ${error}`});
        });

    } catch (error) {
      return res.status(500).json({msg: `Internal server error! ${error}`});
    }
  };

  async deleteUser(req: Request, res: Response){
    const user_id = req.params.id;
    const access = req.user.access;

    if(user_id === req.user.id) 
      return res.status(400).json({msg: 'Você está tentando se auto-excluir! Este tipo de operação é inválida. Contate outro administrador!'});
    
    if((access === 'MANAGER') || (access === 'GUESS'))
      return res.status(400).json({msg: 'Você não tem permissão para executar esta operação! Contate administrador!'});

    try {
      const data ={ deleted: true, updated_at: Date.now() };
      await User.findOneAndUpdate({_id: user_id}, {$set: data}, {new: true})
      .then((result)=>{
        if(!result) return res.status(400).json({msg: 'Usuário inexistente ou não encontrado!'});
        return res.status(200).json({msg: 'Usuário excluído com sucesso!'});
      })
      .catch((error)=>{
        return res.status(400).json({msg: 'Código de usuário inválido!'});
      });
    } catch (error) {
      return res.status(500).json({msg: `Internal server error! ${error}`});
    }
  };
};