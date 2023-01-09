import AppDataSource from '../../database/data-source';

export async function clearDBUser(entity: any, email: string) {
  try {
    await AppDataSource.initialize();
    const repository = await AppDataSource.getRepository(entity.name);
    await repository.delete({ email: `${email}` });
  } catch (error) {
    console.error(error);
  }
}

export async function seedDBData(entity: any, data: any[]) {
  try {
    const arrayResp = [];
    await AppDataSource.initialize();
    const repository = await AppDataSource.getRepository(entity.name);
    for (const unit of data) {
      const newRegister = await repository.create(unit);
      const register = await repository.save(newRegister);
      arrayResp.push(register);
    }
    return arrayResp;
  } catch (error) {
    console.error(error);
  }
}

export async function clearDBData(entity: any, data: any[]) {
  try {
    //await AppDataSource.initialize();
    const repository = await AppDataSource.getRepository(entity.name);
    for (const unit of data) {
      await repository.delete(unit.id);
    }
  } catch (error) {
    console.error(error);
  }
}
