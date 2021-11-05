import { Migration } from '@mikro-orm/migrations';

export class Migration20201104130825 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `user` add `email` text not null;');
  }

}
