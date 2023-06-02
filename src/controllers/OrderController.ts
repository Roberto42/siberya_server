import { Request, Response } from "express"
import Order from "../entities/Order";

export class OrderController{
  async create(req: Request, res: Response){
    const data = req.body;
    const user_id = req.user.id;

    if(!data) return res.status(400).json({msg: 'Requisição vazia!'});

    try {
      data.user = user_id;
      await Order.create(data)
      .then((result)=>{
        return res.status(201).json({msg: 'Order de Serviço criada com sucesso!', order_id: result.id});
      })
      .catch((error)=>{
        return res.status(400).json({msg: 'Não foi possível cadastrar Ordem de Serviço!'});
      })
    } catch (error) {
      return res.status(500).json({msg: `Internal server error! ${error}`});
    };
  };

  async listOrder(req: Request, res: Response){
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
      const orders = await Order.find(query).skip(skip).limit(limit).sort(sort).populate(['customer', 'items']);
        if(!orders) return res.status(400).json({msg: 'Nenhum registro encontrado!'});
      return res.status(200).json(orders);
    } catch (error){
      return res.status(500).json({msg: `Internal server error! ${error}`});
    };        
  };

  async showOrder(req: Request, res: Response){
    const order_id = req.params.id;

    if(!order_id) return res.status(400).json({msg: 'Informe uma Ordem de Serviço!'});

    try {
      await Order.findOne({_id: order_id}).populate('customer')
      .then((result)=>{
        if(!result) return res.status(400).json({msg: 'Ordem de Serviço não encontrada ou inexistente!'});
        return res.status(200).json({order: result});
      })
      .catch((error)=>{
        return res.status(400).json({msg: 'Código de Ordem de Serviço inválido!'});
      });
    } catch (error) {
      return res.status(500).json({msg: `Internal server error! ${error}`});
    }
  };

  async updateOrder(req: Request, res: Response){
    const order_id = req.params.id;
    const access = req.user.access;
    const user_id = req.user.id;
    const data = req.body;

    if(access === 'GUESS') return res.status(400).json({msg: 'Você não tem permissão para executar esta operação!'});
    if(!data) return res.status(400).json({msg: 'Requisição vazia!'});

    try {
      data.user = user_id;
      data.updated_at = Date.now();
      await Order.findOneAndUpdate({_id: order_id}, {$set: data}, {new: true})
      .then((result)=>{
        if(!result) return res.status(400).json({msg: 'Ordem de Serviço inexistente ou não encontrada!'});
        if(result.completed) return res.status(400).json({msg: 'Ordem de Serviço já encerrada, não pode ser modificada!'});
        return res.status(200).json({msg: 'Ordem de Serviço atualizada com sucesso!', order: result});
      })
      .catch((error)=>{
        return res.status(400).json({msg: 'Código de Ordem de Serviço inválido!'});
      });
    } catch (error) {
      return res.status(500).json({msg: `Internal server error! ${error}`});
    }

  };

  async deleteOrder(req: Request, res: Response){
    const order_id = req.params.id;
    const access = req.user.access;

    if(access === 'GUESS') return res.status(401).json({msg: 'Você não tem permissão para executuar esta operação!'});

    try {
      const data = { deleted: true, updated_at: Date.now() };
      await Order.findOneAndUpdate({_id: order_id}, {$set: data}, {new: true})
      .then((result)=>{
        if(!result) return res.status(400).json({msg: 'Ordem de Serviço inexistente ou não encontrada!'});
        return res.status(200).json({msg: 'Ordem de Serviço excluída com sucesso!'});
      })
      .catch((error)=>{
        return res.status(400).json({msg: 'Código de Ordem de Serviço inválido!'});
      })
    } catch (error) {
      return res.status(500).json({msg: `Internal server error! ${error}`});
    };
  };
};