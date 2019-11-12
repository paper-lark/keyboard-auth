export interface Configuration {
  dataPath: string;
  featuresFile: string;
  debug: boolean;
  maxDatasetSize: number;
}

export default class ConfigurationSource {
  public static get(): Configuration {
    if (!process.env.DATA_PATH) {
      throw new Error('Specify path to data in environment variable DATA_PATH');
    }
    if (!process.env.FEATURES_FILENAME) {
      throw new Error(
        'Specify name of the file with raw keyboard data in environment variable DATA_PATH'
      );
    }

    return {
      dataPath: process.env.DATA_PATH,
      featuresFile: process.env.FEATURES_FILENAME,
      debug: false,
      maxDatasetSize: 500
    };
  }
}
