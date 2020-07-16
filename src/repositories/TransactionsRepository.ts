import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
   public async getBalance(): Promise<Balance> {
    // TODO
    const transactions = await this.find() //com o this já buscamos as transações diretamente do banco de dados 
    
    const { income, outcome } = transactions.reduce( //início do método reduce(recebe a função, recebe objeto)
      (accumulator, transaction)=>
      {
        switch(transaction.type) {
          case 'income':
          accumulator.income += Number(transaction.value); //Number força para o tipo número
      //  accumulator.income =+transaction.value;     Dessa maneira tb funcionou
          break;

          case 'outcome':
            accumulator.outcome += Number(transaction.value);
            break;

            default:
              break;
        }
        return accumulator;
      }, 
    
    { 
      income:0,
      outcome:0,
      total:0,
    },
    ); //fim do método reduce

    const total = income - outcome;
    return { income, outcome, total }
  } 
}

export default TransactionsRepository;
