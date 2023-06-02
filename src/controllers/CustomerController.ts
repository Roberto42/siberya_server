import { Request, Response } from "express";
import { Customer } from "../entities/Customer";

export class CustomerController{
  async create(req: Request, res: Response){
    const data = req.body;
    const user_id = req.user.id;

    if(data.length === 0) return res.status(400).json({msg: 'Requisição vazia!'});

    const customerExists = await Customer.findOne({document: data.document});
    if(customerExists) return res.status(400).json({msg: 'Cliente já cadastrado!'});

    try {
      data.user = user_id;
      await Customer.create(data)
      .then((result)=>{
        return res.status(201).json({msg: 'Cliente cadastrado com sucesso!', customer: result});
      })
      .catch((error)=>{
        return res.status(400).json({msg: `Não foi possível incluir dados do cliente! ${error}`});
      });
    } catch (error) {
      return res.status(500).json({msg: `Internal server error! ${error}`});
    };
  };

  async listCustomer(req: Request, res: Response){
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
      const customers = await Customer.find(query).skip(skip).limit(limit).sort(sort);
        if(!customers) return res.status(400).json({msg: 'Nenhum registro encontrado!'});
      return res.status(200).json(customers);
    } catch (error){
      return res.status(500).json({msg: `Internal server error! ${error}`});
    };        
  };

  async showCustomer(req: Request, res: Response){
    const customer_id = req.params.id;

    try {
      await Customer.findOne({_id: customer_id})
      .then((result)=>{
        if(!result) return res.status(400).json({msg: 'Cliente inexistente ou não encontrado!'});
        return res.status(200).json({customer: result});
      })
      .catch((error)=>{
        return res.status(400).json({msg: 'Código de cliente inválido!'});
      });
    } catch (error) {
      return res.status(500).json({msg: `Internal server error! ${error}`});
    }
  };

  async updateCustomer(req: Request, res: Response){
    const customer_id = req.params.id;
    const user_id = req.user.id;
    const access = req.user.access;
    const data = req.body;    

    if (access === 'GUESS')
      return res.status(401).json({msg: 'Você não tem permissão para executar esta operação!'});

    if(!customer_id) return res.status(400).json({msg: 'Informe o cliente!'});
    if(data.length < 1) return res.status(400).json({msg: 'Requisição vazia!'});

    try{
      data.updated_at= Date.now();
      data.user = user_id;

      await Customer.findOneAndUpdate({_id: customer_id}, {$set: data}, {new: true})
      .then(async(result)=>{
        if(!result) return res.status(400).json({msg: 'Cliente não encontrado!'});

        return res.status(200).json({msg: 'Ok', customer: result});
      })
      .catch((error)=>{
        return res.status(400).json({msg: 'Código de cliente inválido!'});
      });
    }catch(error){
      return res.status(500).json({msg: `Internal server error ${error}`});
    };
  };

  async deleteCustomer(req: Request, res: Response){
    const customer_id = req.params.id;
    const access = req.user.access;

    if(access === 'GUESS') return res.status(401).json({sg: 'Você não tem permissão para executar esta operação!'});

    try {
      const data = { deleted: true, updated_at: Date.now() };
      await Customer.findOneAndUpdate({_id: customer_id}, {$set: data}, {new: true})
      .then((result)=>{
        if(!result) return res.status(400).json({msg: 'Cliente inexistente ou não encontrado!'});
        return res.status(200).json({msg: 'Cliente excluído com sucesso!'});
      })
      .catch((error)=>{
        return res.status(400).json({msg: 'Código de cliente inválido!'});
      });
    } catch (error) {
      return res.status(500).json({msg: `Internal server error! ${error}`});
    };
  };
};