const commonServices = require("common-services");
const { CommunicationService } = commonServices;
const operations = require("./operations/index.js");

async function messageHandlerStrategy(message) {

    try {
        message = JSON.parse(message);
    } catch (e) {
        console.error(e);
        throw e;
    }

    const communicationService = CommunicationService.getCommunicationServiceInstance();

    if (typeof operations[message.operation] === "function") {
        //call this after moving all the operations in separate files
        operations[message.operation](message);
    } else {
        console.log("*******************************");
        console.log(`Received message from ${message.senderIdentity}`);
        console.log("*******************************");
        message.operation = "Could not handle message. Unknown operation";
        await communicationService.sendMessage(message.senderIdentity, message);
    }
}

module.exports = messageHandlerStrategy;