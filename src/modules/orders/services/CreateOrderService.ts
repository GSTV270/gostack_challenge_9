import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const validateCustomer = await this.customersRepository.findById(
      customer_id,
    );

    if (!validateCustomer) {
      throw new AppError('Customer does not exists');
    }

    const productsIds = products.map(p => ({ id: p.id }));

    const validateProducts = await this.productsRepository.findAllById(
      productsIds,
    );

    if (validateProducts.length !== productsIds.length) {
      throw new AppError('You can not create order with unexistent produdct');
    }

    const updatedQuantities: IProduct[] = [];

    validateProducts.forEach(product => {
      const productIndex = products.findIndex(p => p.id === product.id);

      if (product.quantity < products[productIndex].quantity) {
        throw new AppError('There is no product in stock available');
      }

      updatedQuantities.push({
        id: product.id,
        quantity: product.quantity - products[productIndex].quantity,
      });
    });

    await this.productsRepository.updateQuantity(updatedQuantities);

    const orderProducts = validateProducts.map(product => {
      const productIndex = products.findIndex(p => p.id === product.id);

      return {
        product_id: product.id,
        price: product.price,
        quantity: products[productIndex].quantity,
      };
    });

    const orderData = {
      customer: validateCustomer,
      products: orderProducts,
    };

    const order = await this.ordersRepository.create(orderData);

    return order;
  }
}

export default CreateOrderService;
