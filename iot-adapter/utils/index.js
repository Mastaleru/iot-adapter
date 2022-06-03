const config = require("./../../env.json");

const getDomainConfig = () => {
    return {
        "type": "IotAdaptor",
        "option": {
            "endpoint": `${config.IOT_ADAPTOR_PORT}`
        }
    }
}

module.exports = {getDomainConfig}
