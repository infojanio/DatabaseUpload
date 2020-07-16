import { Router } from 'express';
import multer from 'multer'; //upload de arquivos
import { getCustomRepository } from 'typeorm';

 import TransactionsRepository from '../repositories/TransactionsRepository';
 import CreateTransactionService from '../services/CreateTransactionService';
 import DeleteTransactionService from '../services/DeleteTransactionService';
 import ImportTransactionsService from '../services/ImportTransactionsService';
 import uploadConfig from '../config/upload';

const upload = multer(uploadConfig); //criação da instância
const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {   // Lista todas as transações
const transactionRepository = getCustomRepository(TransactionsRepository);
const transactions = await transactionRepository.find();

const balance = await transactionRepository.getBalance(); //chama o método do transctionRepository

return response.json({ transactions, balance }); //passa o objeto 
});


transactionsRouter.post('/', async (request, response) => { // Rota de criação de transaction  
  const { title, type, value, category } = request.body; //requisição dos dados
  const createTransaction = new CreateTransactionService(); //cria a instância 
  
  const transaction = await createTransaction.execute({
    title,
    type,
    value,
    category,
  });
  return response.json(transaction);
});


transactionsRouter.delete('/:id', async (request, response) => {   // Rota de exclusão
const { id } = request.params;
const deleteTransaction = new DeleteTransactionService();
await deleteTransaction.execute(id);
return response.status(204).send();
});

// Rota de importação de arquivos
transactionsRouter.post('/import',  
  upload.single('file'), async (request, response) => { 
  
  const importTransactions = new ImportTransactionsService();
  const transactions = await importTransactions.execute(request.file.path);
  return response.json(transactions);
  

});

export default transactionsRouter;
