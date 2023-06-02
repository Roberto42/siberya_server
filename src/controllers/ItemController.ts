import { Request, Response } from "express";
import { Item } from "../entities/Item";
import Order from "../entities/Order";

export class ItemController{
  async create(req: Request, res: Response){
    const order_id = req.params.id;
    const user_id = req.user.id;
    const data = req.body;

    if(!data) return res.status(400).json({msg: 'Requisiçao vazia!'});

    const order = await Order.findOne({_id: order_id});
    if(!order) return res.status(400).json({msg: 'Ordem de Serviço inexistente ou não encontrada!'});

    try {
      /**ADD ALL ITEMS IN ARRAY ITEMS */
      await Promise.all(data.map(async (item:any) => {
        const newItem = new Item({...item, order: order_id, user: user_id});
        await newItem.save();

        order.items.push(newItem._id);
      }));

      /**SUM AMOUNTS IN ITEMS */      
      const totalAmount = await Item.aggregate([
        { $match: { order: order._id } }, // filter by category
        { $group: { _id: null, total: { $sum: "$amount" } } } // calculate the sum of the amount field
      ]);
      
      /**UPDATE AMOUNTS, ITEMS AND UPDATED_AT OF ORDER */
      const updt = {
        items: order.items,
        amount: totalAmount[0].total,
        updated_at: Date.now(),
        user: user_id,
      }

      /**UPDATE ORDER WITH AMOUNT, UPDATED_AT AND USER */
      await Order.findOneAndUpdate({_id: order_id},{$set: updt})
      .then((result)=>{
        let msgs: string;        
        (data.length > 1) ? msgs = 'Itens adicionados com sucesso!' : msgs = 'Item adicionado com sucesso!';
        return res.status(201).json({msg: msgs});
      })
      .catch(async (error)=>{
        await Item.deleteMany({order: order_id});
        return res.status(400).json({msg: 'Código de Ordem de Serviço inválido!'});
      });

    } catch (error) {
      return res.status(500).json({msg: `Internal server error ${error}`});
    }
  };

  async update(req: Request, res: Response){
    const item_id = req.params.item_id;
    const data = req.body;

    try {
      data.user = req.user.id;
      data.updated_at = Date.now();
      await Item.findOneAndUpdate({_id: item_id}, {$set: data}, {new: true})
      .then(async (result)=>{
        if(!result) return res.status(400).json({msg: 'Item inexistente ou não encontrado!'});        

        /**SUM AMOUNTS IN ITEMS */
        // const totalAmount = await Item.aggregate([{
        //   $group: {
        //       _id: result.order,
        //       total: { $sum: "$amount" }
        //   }
        // }]);

        /**SUM AMOUNTS IN ITEMS */      
        const totalAmount = await Item.aggregate([
          { $match: { order: result.order } }, // filter by category
          { $group: { _id: null, total: { $sum: "$amount" } } } // calculate the sum of the amount field
        ]);

        const updt = {
          updated_at: Date.now(),
          user: req.user.id,
          amount: totalAmount[0].total,
        };

        await Order.findOneAndUpdate({_id: result.order}, {$set: updt}, {new: true})

        return res.status(200).json({msg: 'Item atualizado com sucesso!'});
      })
      .catch((error)=>{
        return res.status(400).json({msg: 'Código do Item inválido!'});
      });      
    } catch (error) {
      return res.status(500).json({msg: `Internal server error! ${error}`});
    };
  };

  async listItems(req: Request, res: Response){
    const order_id = req.params.id;

    try{
      await Item.find({order: order_id})
      .then((result)=>{
        if(!result) return res.status(400).json({msg: 'Ordem de Serviço não encontrada ou inexistente!'});
        return res.status(200).json(result);
      })
      .catch((error)=>{
        return res.status(400).json({msg: 'Código de Ordem de Serviço inválido!'})
      });
    } catch (error){
      return res.status(500).json({msg: `Internal server error! ${error}`});
    };
  };

  async deleteItems(req: Request, res: Response){
    const item_id = req.params.item_id;
    const user_id = req.user.id;

    try {
      await Item.findOneAndDelete({_id: item_id}, {new: true})
      .then(async (resultItem)=>{
        if(!resultItem) return res.status(400).json({msg: 'Item inexistente ou não encontrado!'});
        const order_id = resultItem.order;

        /**SUM AMOUNTS IN ITEMS */
        const totalAmount = await Item.aggregate([{
          $group: {
            _id: order_id,
            total: { $sum: "$amount" }
          }
        }]);

        const updt = {
          updated_at: Date.now(),
          user: user_id,
          amount: totalAmount[0].total,
        };

        await Order.findOneAndUpdate({_id: resultItem.order}, {$set : updt},{new: true});
        await Order.findOneAndUpdate({_id: resultItem.order}, {$pull: {items: item_id}});
        return res.status(200).json({msg: 'Item excluído co sucesso!'});
      })
      .catch((error)=>{
        return res.status(400).json({msg: 'Código do item inválido!'});
      });        
    } catch (error) {
      return res.status(500).json({msg: `Internal server error! ${error}`});
    }
  };
};