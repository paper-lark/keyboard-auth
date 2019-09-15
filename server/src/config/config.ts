
export interface Configuration {
    port: number;
}

export default class ConfigurationSource {
    public static get(): Configuration {
        return {
            port: 3000
        }; // FIXME: read from env variables
    }
}