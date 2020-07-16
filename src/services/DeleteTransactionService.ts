 import { getCustomRepository } from 'typeorm';

 import TransactionsRepository from '../repositories/TransactionsRepository';
 import Transaction from '../models/Transaction'; 
 import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(id:string): Promise<void> {
    // Vamos buscar do banco de dados, se existir(delete) senão (erro)
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const transaction = await transactionRepository.findOne(id);
    
    //retornar erro caso não encontre o id da transação
    if(!transaction) {
      throw new AppError('Essa transação não existe!');
    }
    await transactionRepository.remove(transaction); //caso encontre, apenas remove
  }
}

export default DeleteTransactionService;
