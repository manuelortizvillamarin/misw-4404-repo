import { Test, TestingModule } from '@nestjs/testing';
import { ProductEntity } from '../product/product.entity';
import { StoreEntity } from '../store/store.entity';
import { Repository } from 'typeorm';
import { ProductStoreService } from './product-store.service';
import { faker } from '@faker-js/faker';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';

describe('ProductStoreService', () => {
  let service: ProductStoreService;
  let productRepository: Repository<ProductEntity>;
  let storeRepository: Repository<StoreEntity>;
  let product: ProductEntity;
  let storesList: StoreEntity[];


  const seedDatabase = async () => {
    productRepository.clear();
    storeRepository.clear();

    storesList = [];
    for (let i = 0; i < 5; i++) {
      const store: StoreEntity = await storeRepository.save({
        name: faker.company.name(),
        city: faker.address.cityName(),
        address: faker.address.streetAddress()
      })
      storesList.push(store);
    }

    product = await productRepository.save({
      name: faker.company.name(),
      price: faker.finance.amount(),
      type: faker.lorem.word(),
      stores: storesList
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ProductStoreService],
    }).compile();

    service = module.get<ProductStoreService>(ProductStoreService);
    productRepository = module.get<Repository<ProductEntity>>(getRepositoryToken(ProductEntity));
    storeRepository = module.get<Repository<StoreEntity>>(getRepositoryToken(StoreEntity));
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addStoreToProduct should add a store to a product', async () => {
    const newStore: StoreEntity = await storeRepository.save({
      name: faker.company.name(),
      city: faker.address.cityName(),
      address: faker.address.streetAddress()
    });

    const newProduct: ProductEntity = await productRepository.save({
      name: faker.company.name(),
      price: faker.finance.amount(),
      type: faker.lorem.word()
    })

    const result: ProductEntity = await service.addStoreToProduct(newProduct.id, newStore.id);

    expect(result.stores.length).toBe(1);
    expect(result.stores[0]).not.toBeNull();
    expect(result.stores[0].name).toBe(newStore.name)
    expect(result.stores[0].city).toBe(newStore.city)
    expect(result.stores[0].address).toBe(newStore.address)
  });

  it('addStoreToProduct should thrown exception for an invalid store', async () => {
    const newProduct: ProductEntity = await productRepository.save({
      name: faker.company.name(),
      price: faker.finance.amount(),
      type: faker.lorem.word()
    })

    await expect(() => service.addStoreToProduct(newProduct.id, "0")).rejects.toHaveProperty("message", "The store with the given id was not found");
  });

  it('addStoreToProduct should throw an exception for an invalid product', async () => {
    const newStore: StoreEntity = await storeRepository.save({
      name: faker.company.name(),
      city: faker.address.cityName(),
      address: faker.address.streetAddress()
    });

    await expect(() => service.addStoreToProduct("0", newStore.id)).rejects.toHaveProperty("message", "The product with the given id was not found");
  });

  it('findStoresFromProduct should return stores by product', async () => {
    const stores: StoreEntity[] = await service.findStoresFromProduct(product.id);
    expect(stores.length).toBe(5)
  });

  it('findStoresFromProduct should throw an exception for an invalid product', async () => {
    await expect(() => service.findStoresFromProduct("0")).rejects.toHaveProperty("message", "The product with the given id was not found");
  });

  it('findStoreFromProduct should return a store by product', async () => {
    const store: StoreEntity = storesList[0];
    const storedStore: StoreEntity = await service.findStoreFromProduct(product.id, store.id)
    expect(storedStore).not.toBeNull();
    expect(storedStore.name).toBe(store.name);
    expect(storedStore.city).toBe(store.city);
    expect(storedStore.address).toBe(store.address);
  });

  it('findStoreFromProduct should throw an exception for an invalid store', async () => {
    await expect(() => service.findStoreFromProduct(product.id, "0")).rejects.toHaveProperty("message", "The store with the given id was not found");
  });

  it('findStoreFromProduct should throw an exception for an invalid product', async () => {
    const store: StoreEntity = storesList[0];
    await expect(() => service.findStoreFromProduct("0", store.id)).rejects.toHaveProperty("message", "The product with the given id was not found");
  });

  it('updateStoresFromProduct should update stores list for a product', async () => {
    const newStore: StoreEntity = await storeRepository.save({
      name: faker.company.name(),
      city: faker.address.cityName(),
      address: faker.address.streetAddress()
    });

    const updatedProduct: ProductEntity = await service.updateStoresFromProduct(product.id, [newStore]);
    expect(updatedProduct.stores.length).toBe(1);

    expect(updatedProduct.stores[0].name).toBe(newStore.name);
    expect(updatedProduct.stores[0].city).toBe(newStore.city);
    expect(updatedProduct.stores[0].address).toBe(newStore.address);
  });

  it('updateStoresFromProduct should throw an exception for an invalid product', async () => {
    const newStore: StoreEntity = await storeRepository.save({
      name: faker.company.name(),
      city: faker.address.cityName(),
      address: faker.address.streetAddress()
    });

    await expect(() => service.updateStoresFromProduct("0", [newStore])).rejects.toHaveProperty("message", "The product with the given id was not found");
  });

  it('updateStoresFromProduct should throw an exception for an invalid store', async () => {
    const newStore: StoreEntity = storesList[0];
    newStore.id = "0";

    await expect(() => service.updateStoresFromProduct(product.id, [newStore])).rejects.toHaveProperty("message", "The store with the given id was not found");
  });

  it('deleteStoreFromProduct should remove an store from a product', async () => {
    const store: StoreEntity = storesList[0];

    await service.deleteStoreFromProduct(product.id, store.id);

    const storedProduct: ProductEntity = await productRepository.findOne({ where: { id: product.id }, relations: ["stores"] });
    const deletedStore: StoreEntity = storedProduct.stores.find(item => item.id === store.id);

    expect(deletedStore).toBeUndefined();

  });

  it('deleteStoreFromProduct should thrown an exception for an invalid store', async () => {
    await expect(() => service.deleteStoreFromProduct(product.id, "0")).rejects.toHaveProperty("message", "The store with the given id was not found");
  });

  it('deleteStoreFromProduct should thrown an exception for an invalid product', async () => {
    const store: StoreEntity = storesList[0];
    await expect(() => service.deleteStoreFromProduct("0", store.id)).rejects.toHaveProperty("message", "The product with the given id was not found");
  });

  it('deleteStoreFromProduct should thrown an exception for an non asocciated store', async () => {
    const newStore: StoreEntity = await storeRepository.save({
      name: faker.company.name(),
      city: faker.address.cityName(),
      address: faker.address.streetAddress()
    });

    await expect(() => service.deleteStoreFromProduct(product.id, newStore.id)).rejects.toHaveProperty("message", "The store with the given id is not associated to the product");
  });

});
