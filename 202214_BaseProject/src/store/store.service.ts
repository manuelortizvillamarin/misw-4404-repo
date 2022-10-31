import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { StoreEntity } from './store.entity';

@Injectable()
export class StoreService {

    constructor(
        @InjectRepository(StoreEntity)
        private readonly storeRepository: Repository<StoreEntity>
    ) { }

    async findAll(): Promise<StoreEntity[]> {
        return await this.storeRepository.find({ relations: ["products"] });
    }

    async findOne(id: string): Promise<StoreEntity> {
        const store: StoreEntity = await this.storeRepository.findOne({ where: { id }, relations: ["products"] });
        if (!store)
            throw new BusinessLogicException("The store with the given id was not found", BusinessError.NOT_FOUND);

        return store;
    }

    async create(store: StoreEntity): Promise<StoreEntity> {
        return await this.storeRepository.save(store);
    }

    async update(id: string, store: StoreEntity): Promise<StoreEntity> {
        const persistedStore: StoreEntity = await this.storeRepository.findOne({ where: { id } });
        if (!persistedStore)
            throw new BusinessLogicException("The store with the given id was not found", BusinessError.NOT_FOUND);

        store.id = id;
        return await this.storeRepository.save(store);
    }

    async delete(id: string) {
        const store: StoreEntity = await this.storeRepository.findOne({ where: { id } });
        if (!store)
            throw new BusinessLogicException("The store with the given id was not found", BusinessError.NOT_FOUND);

        await this.storeRepository.remove(store);
    }

}
