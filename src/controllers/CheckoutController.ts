import { Request, Response } from "express";
import Checkout from "../entities/Checkout";
import Order from "../entities/Order";
import Installments from "../entities/Installments";

export class CheckoutController{
  async create(req: Request, res: Response){
    const order_id = req.params.id;
    const user_id  = req.user.id;
    const data     = req.body;

    var installments: number;

    if(!data.installments){
      installments = 1;
    }else{
      installments = parseInt(data.installments);
    }
    if(installments === 0) return res.status(400).json({msg: 'Parcela mínima tem que ser maior ou igual a 1!'});

    try {
      await Order.findOne({_id: order_id})
      .then(async(order)=>{
        if(!order) return res.status(400).json({msg: 'Ordem de Serviço inexistente ou não encontrada!'});
        if(order.status !== 'APROVED') return res.status(400).json({msg: 'Ordem de Serviço não aprovada!'});
        if(order.completed) return res.status(400).json({msg: 'Ordem de Serviço já lançada!'});

        await Checkout.create({
          order: order._id,
          payment_condition: data.payment_condition,
          amount: data.amount,
          discount: data.discount,
          total_amount: data.total_amount,
          user: user_id,
        })
        .then(async(checkout)=>{
          const month = new Date();

          for(var i=0; i<installments; i++){
            var expires = (month.setMonth(month.getMonth()+1)+i);
            const newInstallments = new Installments({
              order: checkout._id,
              checkout: checkout._id,
              quota: i + 1,
              quota_amount: (checkout.total_amount / installments),
              expires,
              user: user_id,              
            });
            await newInstallments.save();
            checkout.installments.push(newInstallments._id);
          };
          await checkout.save();

          /**UPDATE ORDER WITH COMPLETED*/
          await Order.findOneAndUpdate({_id: order._id},{$set:{completed: true, updated_at: Date.now(), user: req.user.id}});
          return res.status(201).json({msg: 'Ordem de Serviço lançada com sucesso!'});
        })
        .catch(()=>{
          return res.status(400).json({msg: 'Não foi possível finalizar este checkout!'});
        })
      })
      .catch((error)=>{
        return res.status(400).json({msg: 'Código de Ordem de Serviço inválido!'});
      });
    } catch (error) {
      return res.status(500).json({msg: `Internal server error! ${error}`});
    };
  };
};