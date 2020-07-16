// import AppError from '../errors/AppError';
import { getCustomRepository, getRepository } from 'typeorm'; 

import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({ title, type, value, category }:Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    //Verifica se tem saldo suficiente pra realizar a transação
    const { total } = await transactionRepository.getBalance();
    if (type=='outcome' && total < value ) {
      throw new AppError('Você não têm saldo suficiente!');
    }

    //Verifica se já existe a categoria com o titulo
    let transactionCategory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });
    //se não existe a categoria, será criada uma nova  
    if(!transactionCategory) {
      transactionCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(transactionCategory);
    }

    //Criação de uma nova transação
    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category: transactionCategory,
    });
    await transactionRepository.save(transaction); //salva o objeto transaction criado
    return transaction;
  }
}

export default CreateTransactionService;
