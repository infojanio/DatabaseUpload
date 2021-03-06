import {
Entity,
Column,
PrimaryGeneratedColumn,
ManyToOne,
JoinColumn,
CreateDateColumn,
UpdateDateColumn
} from 'typeorm';

import Category from './Category';

@Entity('transactions')
class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  type: 'income' | 'outcome';

  @Column('decimal')
  value: number;

  @ManyToOne(()=> Category) //Muitas transações para um tipo (income ou outcome)
  @JoinColumn({ name: 'category_id' }) //coluna usada para fazer o relacionamento
  category: Category;

  @Column()
  category_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Transaction;
