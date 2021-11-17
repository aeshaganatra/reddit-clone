import { MikroORM } from "@mikro-orm/core";
import microConfig from '../mikro-orm.config'

const main = async () => { 
    const orm = await MikroORM.init(microConfig);
    const generator = orm.getSchemaGenerator();
    const dropDump = await generator.getDropSchemaSQL();
    console.log(dropDump);

    const createDump = await generator.getCreateSchemaSQL();
    console.log(createDump);

    const updateDump = await generator.getUpdateSchemaSQL();
    console.log(updateDump);

    await generator.dropSchema();
    await generator.createSchema();
    await generator.updateSchema();

    await orm.close(true);
};

main().catch(err => {
    console.log(err);
});