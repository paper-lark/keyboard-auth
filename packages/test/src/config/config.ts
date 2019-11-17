import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import { logger } from 'keyboard-auth-common/lib/utils/logger';
import { Cast } from 'keyboard-auth-common/lib/utils/Cast';

export interface ModelConfiguration {
  single: number;
  digraph: number;
  discretizationBins: number;
  threshold: number;
}

export interface RunnerConfiguration {
  root: string;
  featuresFile: string;
  debug: boolean;
  maxInteractions: number;
}

export interface Configuration {
  runner: RunnerConfiguration;
  model: ModelConfiguration;
}

export namespace ConfigurationSource {
  export function get(): Configuration {
    const configFile = path.resolve('config.yaml');
    logger.debug(`Loading configuration file: ${configFile}`);
    const config = yaml.load(fs.readFileSync(configFile, 'utf8')) as unknown;
    const configObject = Cast.toObject(config);
    const runnerConfig = Cast.toObject(configObject.runner);
    const modelConfig = Cast.toObject(configObject.model);
    return {
      runner: {
        root: Cast.toString(runnerConfig.root),
        featuresFile: Cast.toString(runnerConfig.featuresFile),
        debug: Cast.toBoolean(runnerConfig.debug),
        maxInteractions: Cast.toNumber(runnerConfig.maxInteractions)
      },
      model: {
        single: Cast.toNumber(modelConfig.single),
        digraph: Cast.toNumber(modelConfig.digraph),
        discretizationBins: Cast.toNumber(modelConfig.discretizationBins),
        threshold: Cast.toNumber(modelConfig.threshold)
      }
    };
  }
}
