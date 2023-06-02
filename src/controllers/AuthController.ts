import { Request, Response } from "express";
import { generateToken } from "./UserController";
import User from "../entities/User";
import bcrypt from "bcrypt";
import crypto from "crypto";
import transport from "../mailers/mailer";

export class AuthController{
  
  async login(req: Request, res: Response){
    const { email, password } = req.body;

    if(!email) return res.status(400).json({msg: 'Digite email de acesso!'});
    if( password.length < 6 ) return res.status(400).json({msg: 'Senha deve conter ao menos 6 caracteres!'});
    if(!password) return res.status(400).json({msg: 'Senha nao pode ser e branco!'});

    try {
      const login = await User.findOne({email}).populate('pass');
        if(!login) return res.status(400).json({msg: 'Usuário ou senha inválidos!'});

      const verifyPass = await bcrypt.compare(password, login.pass);      
        if(!verifyPass) return res.status(400).json({msg: 'Usuário ou senha inválidos!'});

      res.status(200).json({id: login.id, token: generateToken({id: login.id})});

    } catch (error) {
      return res.status(500).json({msg: `Internal server error! ${error}`});
    }
  };

  async recoveryPassword(req: Request, res: Response){
    const { email } = req.body;

    if(!email) return res.status(400).json({msg: 'Informe email cadastrado no sistema!'});

    try {
      const user = User.findOne({email});
      if (!user) return res.status(400).json({msg: 'Usuário/Email não cadastrado!'});
      
      const token = crypto.randomBytes(20).toString('hex');
      const now   = new Date();
      now.setHours(now.getHours()+1);

      const data = {
        resetTokenPassword : token,
        resetTokenExpires : now,
      };

      await User.findOneAndUpdate({email}, data)
      .then((result)=>{

        var mailOptions = {
          to: email,
          from: 'flash2104@hotmail.com',
          subject: 'Token para recuperação do acesso à Siberya App',
          text: `Solicitação para recuperar senha foi envida! `+
                `Acesse a plataforma e insira este token: ${token}`
        };

        transport.sendMail(mailOptions, (error, response)=>{
          if(error) return res.status(400).json({msg: `Não foi possível enviar o email! ${error}`});
          else return res.status(200).json({msg:'Acesse token enviado no seu email!'});
        });
      })
      .catch((error: any)=>{
        return res.status(400).json({msg: `Não foi possível recuperar seu acesso! Contate Administrador ${error}`});
      });

    } catch (error) {
      return res.status(500).json({msg: `Internal server error! ${error}`});
    }
  };

  async resetPassword(req: Request, res: Response){
    const { email, token, new_password } = req.body;
    
    const user = await User.findOne({email}).populate('resetTokenPassword', 'resetTokenExpires');

    if(!user) return res.status(400).send({ msg: 'Usuário/Email não encontrado!' });    
    if(token !== user.resetTokenPassword) return res.status(400).send({ msg: 'Token inválido!' });

    if(!new_password) return res.status(400).json({msg: 'Informe a nova senha!'});
    if(new_password.length < 6) res.status(400).json({msg: 'Senha deve conter no mínimo 6 caracteres!'});

    const now = new Date();
    if(now > (user?.resetTokenExpires as Date))
        return res.status(400).send({ msg: 'Token expirado, gere um novo!' });

    try{
      const hash = await bcrypt.hash(new_password, 10);
      const data = {
        pass: hash,
        updated_at: Date.now(),
        resetTokenPassword: null,
        resetTokenExpires: null,
      };
      await User.findOneAndUpdate({email}, {$set: data}, {new: true})
      .then((result)=>{
        return res.status(200).send({ msg: 'Nova senha criada com sucesso!' });
      })
      .catch((error)=>{
        return res.status(400).send({ msg: `Não foi possível criar nova senha. Tente novamente! ${error}` });
      });
      
    } catch(error: any){
        res.status(500).send({ msg: `Internal server error ${error}`});
    }
  };

  async changePassword(req: Request, res: Response){
    const { password, new_password } = req.body;
    const user_id = req.user.id;

    if(!new_password) return res.status(400).json({msg: 'Informe a nova senha!'});
    if(new_password.length < 6) return res.status(400).json({msg: 'Nova senha deve conter ao menos 6 caracteres!'});

    try {
      await User.findOne({_id: user_id}).populate('pass')
      .then(async (result)=>{
        const pass_word = result?.pass as string;
        const verifyPass = await bcrypt.compare(password, pass_word);
        if(!verifyPass) return res.status(400).json({msg: 'Senha inválida!'}); 

        const newPass = await bcrypt.hash(new_password, 10);
        const data = {
          pass: newPass,
          updated_at: Date.now(),
        };
        await User.findOneAndUpdate({_id: user_id}, {$set: data})
        .then(()=>{
          return res.status(200).json({msg: 'Senha atualizada com sucesso!'});
        })
        .catch((error)=>{
          return res.status(400).json({msg: `Erro tentar atualizar senha! ${error}`});
        });        
      })
      .catch((error)=>{
        return res.status(400).json({msg: `Não foi possível atualizar sua senha! Usuário inválido! ${error}`});
      });
    } catch (error) {
      return res.status(500).json({msg: `Internal server error! ${error}`});
    };
  };
};