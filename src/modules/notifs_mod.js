var AWS = require('aws-sdk');
var global_vars;

// AWS.config.update({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
// });

var ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
var API_KEY_SID = process.env.TWILIO_API_KEY_SID;
var API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET;
var TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(ACCOUNT_SID, API_KEY_SECRET);
const client_master = require('twilio')(ACCOUNT_SID, TWILIO_AUTH_TOKEN);

module.exports = {
    init: function (new_global_vars) {
        global_vars = new_global_vars;
    },

    sendSMSUsingTemplate: async function(phoneNumber, template, variables) {


        let message = template;

        for (let [key, value] of Object.entries(variables)) {
            message = message.replace(`{${key}}` ,value);
        }

        await this.sendSMS(phoneNumber, message);


    },

    sendSMS: async function (phoneNumber, message) {

        phoneNumber = phoneNumber.replace('+', '');

        // TWILIO
        client_master.messages
            .create({
                body: message,
                from: 'basma',
                to: phoneNumber
            })
            .then(message => console.log(message.sid)).catch((err) => {
            console.log(err);
        });

        // AWS, VERY SLOW & UNRELIABLE!!!

        // // Create SMS Attribute parameters
        // var params = {
        //     attributes: { /* required */
        //         'DefaultSMSType': 'Transactional', /* highest reliability */
        //         //'DefaultSMSType': 'Promotional', /* lowest cost */
        //         'DefaultSenderID': 'basma'
        //     }
        // };
        //
        // let aws_sns = new AWS.SNS({ apiVersion: '2010-03-31', region: 'eu-west-1' });
        //
        // // Create promise and SNS service object
        // let setSMSTypePromise = aws_sns.setSMSAttributes(params).promise();
        //
        // // Handle promise's fulfilled/rejected states
        // await setSMSTypePromise.then(
        //     function (data) {
        //         global_vars.logger.debug(`notifs_mod:sms ${data}`);
        //
        //     }).catch(
        //     function (err) {
        //         global_vars.logger.debug(`notifs_mod:sms error ${err}`);
        //     });
        //
        // // Create publish parameters
        // var params = {
        //     Message: message, /* required */
        //     PhoneNumber: phoneNumber,
        // };
        //
        // // Create promise and SNS service object
        // var publishTextPromise = aws_sns.publish(params).promise();
        //
        // // Handle promise's fulfilled/rejected states
        // publishTextPromise.then(
        //     function (data) {
        //         global_vars.logger.debug(`notifs_mod:sms SMS Sent, ID:  ${data.MessageId}`);
        //
        //     }).catch(
        //     function (err) {
        //         global_vars.logger.debug(`notifs_mod:sms error ${err}`);
        //     });
    },
    sendEmail: async function (email, subject, message) {


        try {
            // Create sendEmail params
            var params = {
                Destination: { /* required */
                    CcAddresses: [
                        /* more items */
                    ],
                    ToAddresses: [
                        email,
                        /* more items */
                    ]
                },
                Message: { /* required */
                    Body: { /* required */
                        Html: {
                            Charset: "UTF-8",
                            Data: message
                        },
                        Text: {
                            Charset: "UTF-8",
                            Data: message
                        }
                    },
                    Subject: {
                        Charset: 'UTF-8',
                        Data: subject
                    }
                },
                Source: 'no-reply@basma.ai', /* required */
            };

            // Create the promise and SES service object
            var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();

            // Handle promise's fulfilled/rejected states
            sendPromise.then(
                function (data) {
                    console.log(data.MessageId);
                }).catch(
                function (err) {
                    console.error(err, err.stack);
                });
        } catch (ex) {
            console.log(ex);
        }
    }
};
