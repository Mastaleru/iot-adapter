const config = require("./../../env.json");

const getDomainConfig = () => {
    return {
        "type": "IotAdaptor",
        "option": {
            "endpoint": `http://localhost:${config.IOT_ADAPTOR_PORT}`
        }
    }
}

const domainConfig = getDomainConfig();

module.exports = {domainConfig}
