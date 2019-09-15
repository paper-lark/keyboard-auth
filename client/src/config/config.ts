import path from 'path';
import os from 'os';
import fs from 'fs';
import { logger } from '../utils/logger';

export interface Configuration {
    host: string; // host of the server
    login: string; // user login
    token: string; // user authentication token
}

export default class ConfigurationSource {
    public static get(): Configuration {
        const configPath = this.getConfigurationPath();
        let existingConfig = {};

        // read existing configuration
        try {
            if (fs.existsSync(configPath)) {
                const buf = fs.readFileSync(configPath);
                existingConfig = JSON.parse(buf.toString());
            }
        } catch (err) {
            logger.error(`Failed to read existing configuration file: ${err}`);
        }

        // save configuration
        const config: Configuration = {
            ...this.getDefaultConfig(),
            ...existingConfig
        };
        try {
            const buf = Buffer.from(JSON.stringify(config));
            fs.writeFileSync(configPath, buf);
        } catch (err) {
            logger.error(`Failed to save configuration file: ${err}`);
        }

        return config;
    }

    private static getDefaultConfig(): Configuration {
        return {
            host: 'localhost:3000',
            login: 'test-user',
            token: '7E9E95A5-B43C-48AD-BCE3-BDF6B19F23A2',
        }; // FIXME: add credentials to the test DB
    }

    private static getConfigurationPath(): string {
        switch (os.type()) {
        case 'linux':
        case 'darwin':
            return path.join(os.homedir(), '.config', 'authenticator', 'config.json');

        case 'win32':
            return path.join(os.homedir(), 'AppData', 'Roaming', 'Authenticator', 'config.json');

        default:
            throw new Error(`Unknown platform: ${os.type()}, cannot read configuration...`);
        }
    }
}
