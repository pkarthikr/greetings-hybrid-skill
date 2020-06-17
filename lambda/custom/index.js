/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */

 // TODO : When the user is enabling the skill, check for permission

const Alexa = require('ask-sdk-core');
const aws = require('aws-sdk');
// i18n library dependency, we use it below in a localisation interceptor
const i18n = require('i18next');
// i18n strings for all supported locales
const languageStrings = require('./languageStrings');
const PERMISSIONS = ['alexa::profile:mobile_number:read', 'alexa::profile:email:read'];
const ddbAdapter = require('ask-sdk-dynamodb-persistence-adapter');
const ddbTableName = 'greetings-data';

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const userAttributes = await attributesManager.getPersistentAttributes() || {};

        if(userAttributes.hasOwnProperty('number') || userAttributes.hasOwnProperty('email')){
            // TODO : Check Messages Queues and if there are messages, play it.
            return handlerInput.responseBuilder
            .speak("Welcome to Skill. Playing your Message")
            .getResponse();
        } else {
            return handlerInput.responseBuilder
            .speak(handlerInput.t('WELCOME_MSG_NO_PERMISSIONS'))
            .withAskForPermissionsConsentCard(PERMISSIONS)
            .getResponse();
        }
    }
};


const SkillPermissionsHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'AlexaSkillEvent.SkillPermissionAccepted' || 
        Alexa.getRequestType(handlerInput.requestEnvelope) === 'AlexaSkillEvent.SkillPermissionChanged'
    },
    async handle(handlerInput) {
        console.log("You are in the Skill Permissions Handlers");
        try {
            const {serviceClientFactory} = handlerInput;
            const client = serviceClientFactory.getUpsServiceClient();
            const number = await client.getProfileMobileNumber();
            const email = await client.getProfileEmail();
            //TODO : Generate a unique URL for the User - https://url.com/unique-id
            //TODO : Send that to user 
            //TODO : How to efficiently send and set parameters within the same promise. 
            const attributesManager = handlerInput.attributesManager;
            let userNumber = "+" + number.countryCode + number.phoneNumber;
            const userAttributes = {
                "number": userNumber,
                "email": email
                
            };
            attributesManager.setPersistentAttributes(userAttributes);
            await attributesManager.savePersistentAttributes();  

            aws.config.update({region: 'us-east-1'});
            var setParams = {
                attributes: { /* required */
                  'DefaultSMSType': 'Transactional'
                }
            };

            var setSMSTypePromise = new aws.SNS({apiVersion: '2010-03-31'}).setSMSAttributes(setParams).promise();

            setSMSTypePromise.then(
            function(data) {
                console.log("Hello Data")
                console.log(data);
                var params = {
                    Message: 'Here is your Link', /* required */
                    PhoneNumber: userNumber,
                    };
        
                    // Create promise and SNS service object
                    var publishTextPromise = new aws.SNS({apiVersion: '2010-03-31'}).publish(params).promise();
        
                    // Handle promise's fulfilled/rejected states
                    publishTextPromise.then(
                    function(data) {
                        console.log(JSON.stringify(data));
                    }).catch(
                        function(err) {
                        console.error(err, err.stack);
                    });
        
            }).catch(
            function(err) {
                console.log(err);
            });
              
            // Create publish parameters
          
            // TODO : Send the SMS and Email to the user with their unique link. 
            console.log("we reach here");
            console.log('Number successfully retrieved, now responding to user.');
            console.log(number);
        } catch (error) {
            console.log(error);
            console.log("We do not have enough data")
        }
       
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('HELP_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('GOODBYE_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('FALLBACK_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = handlerInput.t('REFLECTOR_MSG', {intentName: intentName});

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = handlerInput.t('ERROR_MSG');
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// This request interceptor will bind a translation function 't' to the handlerInput
const LocalisationRequestInterceptor = {
    process(handlerInput) {
        i18n.init({
            lng: Alexa.getLocale(handlerInput.requestEnvelope),
            resources: languageStrings
        }).then((t) => {
            handlerInput.t = (...args) => t(...args);
        });
    }
};

const RequestLog = {
    process(handlerInput) {
        console.log("handlerInput");
        console.log(handlerInput);
    }
}


const ddbPersistenceAdapter = new ddbAdapter.DynamoDbPersistenceAdapter({
    tableName: ddbTableName,
    createTable: true,
});
/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * de
 * fined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        SkillPermissionsHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .withPersistenceAdapter(ddbPersistenceAdapter)
    .addErrorHandlers(
        ErrorHandler)
    .addRequestInterceptors(
        LocalisationRequestInterceptor,
        RequestLog)
    .withApiClient(new Alexa.DefaultApiClient())
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();
