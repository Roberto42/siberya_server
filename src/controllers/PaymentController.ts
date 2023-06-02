import { Request, Response } from "express";
import PaymentConditions from "../entities/PaymentConditions";

export class PaymentController{
  async create(req: Request, res: Response){
    const access  = req.user.access;
    const data = req.body;

    if(access === 'GUESS') return res.status(400).json({msg: 'Você não tem permissão para executar esta operação!'});

    try {
      await PaymentConditions.findOne({conditions: data.conditions})
      .then(async(result)=>{
        if(result) return res.status(400).json({msg: 'Condição de pagamento já cadastrada!'});

        await PaymentConditions.create({...data, user: req.user.id})
        .then(()=>{
          return res.status(201).json({msg: 'Condição de pagamento criada com sucesso!'});
        })
        .catch((error)=>{
          return res.status(400).json({msg: `Erro ao criar condição de pagamento! ${error}`});
        });
      })
      .catch((error)=>{
        return res.status(400).json({msg: `Erro ao solicitar dados do servidor! ${error}`});
      });
    } catch (error) {
      return res.status(500).json({msg: `Internal server error! ${error}`});
    };
  };

  async update(req: Request, res: Response){
    const access = req.user.access;
    const condition_id = req.params.id;
    const data = req.body;

    if (access === 'GUESS') return res.status(400).json({msg: 'Você não tem permissão para executar esta operação!'});

    try {
      await PaymentConditions.findOneAndUpdate({_id: condition_id}, {...data, user: req.user.id, updated_at: Date.now()}, {new: true})
      .then((result)=>{
        if(!result) return res.status(400).json({msg: 'Condição de pagamento inexistente ou não encontrada!'});
        return res.status(200).json({msg: 'Condição de pagamento atualizada com sucesso!'});
      })
      .catch((error)=>{
        return res.status(400).json({msg: 'Código inválido!'});
      });
    } catch (error) {
      return res.status(500).json({msg: `Internal server error! ${error}`});
    }
  };

  async delete(req: Request, res: Response){
    const access = req.user.access;
    const condition_id = req.params.id;

    if (access === 'GUESS') return res.status(400).json({msg: 'Você não tem permissão para executar esta operação!'});

    try {
      await PaymentConditions.findOneAndUpdate({_id: condition_id}, {deleted: true, user: req.user.id, updated_at: Date.now()}, {new: true})
      .then((result)=>{
        if(!result) return res.status(400).json({msg: 'Condição de pagamento inexistente ou não encontrada!'});
        return res.status(200).json({msg: 'Condição de pagamento deletada com sucesso!'});
      })
      .catch((error)=>{
        return res.status(400).json({msg: 'Código inválido!'});
      });
    } catch (error) {
      return res.status(500).json({msg: `Internal server error! ${error}`});
    }

  };

  async list(req: Request, res: Response){
    const conditions = await PaymentConditions.find({deleted:{$ne: true}});
    return res.status(200).json(conditions);
  };
};