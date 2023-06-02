import { Router } from 'express';
import { authMiddleware } from './middleware/authMiddleware';
import { AuthController } from './controllers/AuthController';
import { UserController } from './controllers/UserController';
import { CustomerController } from './controllers/CustomerController';
import { OrderController } from './controllers/OrderController';
import { ItemController } from './controllers/ItemController';
import { PaymentController } from './controllers/PaymentController';
import { CheckoutController } from './controllers/CheckoutController';

const routes = Router();
routes.post('/users/recoveryPassword', new AuthController().recoveryPassword);
routes.post('/users/resetPassword', new AuthController().resetPassword);
routes.post('/users/signin', new AuthController().login);
routes.post('/users', new UserController().create);

routes.use(authMiddleware);
routes.post('/users/changePassword', new AuthController().changePassword);
routes.delete('/users/:id', new UserController().deleteUser);
routes.patch('/users/:id', new UserController().updateUser);
routes.get('/users/profile', new UserController().profile);
routes.get('/users/:id', new UserController().showUser);
routes.get('/users', new UserController().listUser);

routes.delete('/customers/:id', new CustomerController().deleteCustomer);
routes.patch('/customers/:id', new CustomerController().updateCustomer);
routes.get('/customers/:id', new CustomerController().showCustomer);
routes.get('/customers', new CustomerController().listCustomer);
routes.post('/customers', new CustomerController().create);

routes.delete('/orders/:id', new OrderController().deleteOrder);
routes.patch('/orders/:id', new OrderController().updateOrder);
routes.get('/orders/:id', new OrderController().showOrder);
routes.get('/orders', new OrderController().listOrder);
routes.post('/orders', new OrderController().create);

routes.delete('/orders/items/:item_id', new ItemController().deleteItems);
routes.patch('/orders/items/:item_id', new ItemController().update);
routes.get('/orders/:id/items', new ItemController().listItems);
routes.post('/orders/:id/items', new ItemController().create);

routes.delete('/paymentconditions/:id', new PaymentController().delete);
routes.patch('/paymentconditions/:id', new PaymentController().update);
routes.post('/paymentconditions', new PaymentController().create);
routes.get('/paymentconditions', new PaymentController().list);

routes.post('/checkout/:id', new CheckoutController().create);

export default routes;