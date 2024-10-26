import { AppConfig } from 'src/common/services';

export class MongooseCommonModule {
  private static providers = [];

  static forRoot() {
    return {
      module: MongooseCommonModule,
      imports: [],
      providers: [...this.providers, AppConfig],
      exports: [...this.providers],
      global: true,
    };
  }
}
