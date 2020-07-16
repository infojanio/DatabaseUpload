import { getCustomRepository, getRepository, In } from 'typeorm';
import csvParse from 'csv-parse';
import fs from 'fs';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';


interface CSVTransactions {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath:string): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const contactsReadStream = fs.createReadStream(filePath); //variável que lê o arquivo

    const parsers = csvParse({
      from_line: 2, //salta a linha 1 do cabeçalho(header)
    });
    const parseCSV = contactsReadStream.pipe(parsers); //o pipe irá ler as linhas conforme fiquem disponíveis
    
    //variáveis criadas, armazena os dados do push
    const transactions: CSVTransactions[] = []; 
    const categories:string[] = [];
    
    parseCSV.on('data', async line => {
      const [title, type, value, category]= line.map((cell: string) => //desestrutura a header
      cell.trim(), //tira os espaços das vírgulas
      );
      //verifica se as variáveis obrigatórias estão chegando corretamente
      if (!title || !type || !value ) return;
      
      //vamos salvar os dados, abrindo a conexão com o banco apenas 1 vez
      categories.push(category);
      transactions.push({title, type, value, category});
    });
    await new Promise(resolve => parseCSV.on('end', resolve)); //assegura o fim do processo

    //Mapear as categorias existentes no banco de dados de uma vez só
    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories), //busca pelo título da categoria
      }
    });
    //Pega apenas a categoria
    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    //Descobrir as categorias que não existem no banco de dados
    const addCategoryTitles = categories.filter(category => 
      !existentCategoriesTitles.includes(category),
    ).filter((value, index, self)=> self.indexOf(value) == index); //remove categorias duplicados
     
    //pega as categorias filtradas e salva no banco de dados
    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );
    await categoriesRepository.save(newCategories);

    //Retornar todas as categorias existentes
      const finalCategories = [... newCategories, ...existentCategories];

      //Criação das transações
      const createdTransactions = transactionsRepository.create(
        transactions.map(transaction => ({
          title: transaction.title,
          type: transaction.type,
          value: transaction.value,

          category: finalCategories.find(
            category => category.title == transaction.category, //compara se tem os mesmos títulos
          ),
        })),
      );
        await transactionsRepository.save(createdTransactions);
        await fs.promises.unlink(filePath); //exclui o arquivo .csv após ser utilizado

        return createdTransactions;
  }
}

export default ImportTransactionsService;
