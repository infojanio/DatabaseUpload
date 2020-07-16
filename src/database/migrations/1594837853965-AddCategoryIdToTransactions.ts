import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export default class AddCategoryIdToTransactions1594837853965 implements MigrationInterface {
    //criação da coluna category_id dentro da tabela transactions
    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.addColumn('transactions',
      new TableColumn({
          name: 'category_id',
          type: 'uuid',
          isNullable: true,
      }),
      );  

      //criação da chave estrangeira
      await queryRunner.createForeignKey(
          'transactions',
          new TableForeignKey({
              columnNames: ['category_id'],
              referencedColumnNames: ['id'], //referencia o id da tabela categories
              referencedTableName: 'categories',
              name: 'TransactionCategory', //nome da chave estrangeira
              onUpdate: 'CASCADE', //atualiza as tabelas ao mesmo tempo
              onDelete: 'SET NULL', 
          }),
      );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //desfaz o que foi feito
        await queryRunner.dropForeignKey('transactions', 'TransactionCategory'); 
        await queryRunner.dropColumn('transactions', 'category_id');
    }
}
