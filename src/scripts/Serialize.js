export function serializeConfig(pattern) {
    const {defaultConfig, config} = pattern;

    const nonDefaultConfig = {};
    Object.entries(config).forEach(([key, value], i) => {
        if (value !== defaultConfig[key]) {
            nonDefaultConfig[i] = value;
        }
    });

    return JSON.stringify(nonDefaultConfig);
}

export function deserializeConfig(pattern, serializedCofig) {
    const serializedJson = JSON.parse(serializedCofig);
    const deserializedConfig = {};

    Object.keys(pattern.defaultConfig).forEach((key, i) => {
        const serializedValue = serializedJson[i.toString()];
        if (serializedValue !== undefined) {
            deserializedConfig[key] = serializedValue;
        }
    });

    return deserializedConfig;
}
