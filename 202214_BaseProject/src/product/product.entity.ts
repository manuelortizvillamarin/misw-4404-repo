import { StoreEntity } from '../store/store.entity';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ProductEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    price: string;

    @Column()
    type: string;

    @ManyToMany(() => StoreEntity, store => store.products)
    @JoinTable()
    stores: StoreEntity[];

}
