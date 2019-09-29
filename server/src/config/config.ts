
export interface Configuration {
    port: number;
    db: {
        hostname: string;
        port: number;
        username: string;
        password: string;
        dbname: string;
    };
}

export default class ConfigurationSource {
    public static get(): Configuration {
        return {
            port: 3000,
            db: {
                hostname: 'localhost',
                port: 12001,
                username: 'postgres',
                password: '',
                dbname: 'project'
            }
        }; // TODO: read from env variables
    }
}