import {MigrationInterface, QueryRunner} from "typeorm";

export class FakePosts1604824523543 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`insert into post (title, text, creatorId) values ('Background to Danger', 'Morbi non lectus. Aliquam sit amet diam in magna bibendum imperdiet. Nullam orci pede, venenatis non, sodales sed, tincidunt eu, felis.

Fusce posuere felis sed lacus. Morbi sem mauris, laoreet ut, rhoncus aliquet, pulvinar sed, nisl. Nunc rhoncus dui vel sem.', 1);
insert into post (title, text, creatorId) values ('Bye-Bye Bin Laden', 'Curabitur in libero ut massa volutpat convallis. Morbi odio odio, elementum eu, interdum eu, tincidunt in, leo. Maecenas pulvinar lobortis est.', 1);`);
    }

    public async down(_: QueryRunner): Promise<void> {
    }

}
