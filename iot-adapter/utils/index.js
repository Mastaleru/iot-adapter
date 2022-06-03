const getDomainConfig = () => {
    return {
        "type": "IotAdaptor",
        "option": {
            "endpoint": `http://localhost:${process.env.IOT_ADAPTOR_PORT}`
        }
    }
}

const domainConfig = getDomainConfig();

module.exports = {domainConfig}
