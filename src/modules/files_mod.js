var mime = require('mime-types');
var moment = require('moment');
var md5 = require('md5');
const AWS = require('aws-sdk');
const sharp = require('sharp');

// GLOBAL DEFINITIONS
var s3BucketName = 'basma-files'

// configuring the AWS environment
AWS.config.update({
    accessKeyId: "AKIA3UX6FBMDUNMZ552N",
    secretAccessKey: "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"
});

var s3 = new AWS.S3();
var s3Bucket = s3({ params: { Bucket: s3BucketName } });

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
};

module.exports = {

    getImage: async function (knex, image_id) {

        if (image_id == null) {
            return this.formatImage(null);
        }

        var fileRow;
        var getFile = knex.from('files').select("*").where("id", "=", image_id);
        await getFile.then((rows) => {
            fileRow = rows[0];
        }).catch((err) => {
            console.log(err);
            fileRow = null;
        });

        return this.formatImage(fileRow);


    },
    getFile: async function (knex, file_id) {


        if (file_id == null) {
            return this.formatFile(null);
        }

        var fileRow = null;
        var getFile = knex.from('files').select("*").where("id", "=", file_id);
        await getFile.then((rows) => {
            fileRow = rows[0];
        }).catch((err) => {
            console.log(err);
            fileRow = null;
        });

        if(fileRow == null) {
            return this.formatFile(null);
        }

        return this.formatFile(fileRow);


    },

    formatImage: function (image_row) {

        if (image_row == null) {
            // return a placeholder
            return {
                id: 0,
                url: {
                    "small": "placeholder path",
                    "medium": "placeholder path",
                    "large": "",
                    "original": "placeholder path"
                }
            };
        };

        return {
            id: image_row.id,
            url: {
                "small": image_row.s3_small_path,
                "medium": image_row.s3_medium_path,
                "large": image_row.s3_large_path,
                "original": image_row.s3_original_path,
            },
        }

    },
    formatFile: function (file_row) {


        if (file_row == null) {
            // return a placeholder
            return {
                id: 0,
                url: {
                    "original": "",
                },
            };
        };

        return {
            id: file_row.id,
            url: {
                "original": file_row.s3_original_path,
            },
        }

    },

    uploadImage: async function (options) {

        // let sampleOptions = {
        //     knex: knexdb,
        //     base64_data: thebase64code,
        //     file_name: "test.jpg",
        //     user_id: 154 // optional
        // };



        let mimeType = mime.lookup(options.file_name);
        let imageData = options.base64_data;

        if (imageData.includes(',')) {
            imageData = imageData.split(',')[1];
        }

        var img = new Buffer(imageData, 'base64');

        var resized_small_data_base64, resized_medium_data_base64, resized_large_data_base64;


        await Promise.all([
            sharp(img)
                .resize(250, 250, {
                    fit: sharp.fit.inside
                })
                .toBuffer()
                .then(resizedImageBuffer => {
                    resized_small_data_base64 = resizedImageBuffer.toString('base64');
                })
                .catch(error => {
                    // error handeling
                }),
            sharp(img)
                .resize(500, 500, {
                    fit: sharp.fit.inside
                })
                .toBuffer()
                .then(resizedImageBuffer => {
                    resized_medium_data_base64 = resizedImageBuffer.toString('base64');
                })
                .catch(error => {
                    // error handeling
                }), sharp(img)
                .resize(1000, 1000, {
                    fit: sharp.fit.inside
                })
                .toBuffer()
                .then(resizedImageBuffer => {
                    resized_large_data_base64 = resizedImageBuffer.toString('base64');
                })
                .catch(error => {
                    // error handeling
                })
        ]);

        // do the upload
        var small_url, medium_url, large_url, original_url;
        const responses = await Promise.all([
            this.upload(options.knex, "images", resized_small_data_base64, options.file_name),
            this.upload(options.knex, "images", resized_medium_data_base64, options.file_name),
            this.upload(options.knex, "images", resized_large_data_base64, options.file_name),
            this.upload(options.knex, "images", options.base64_data, options.file_name)
        ]);

        var small_url = responses[0];
        var medium_url = responses[1];
        var large_url = responses[2];
        var original_url = responses[3];


        var fileId;
        await options.knex('files').insert({
            'user_id': options.user_id,
            'type': "image",
            's3_small_path': small_url,
            's3_medium_path': medium_url,
            's3_large_path': large_url,
            's3_original_path': original_url,
            'time': Date.now() / 1000
        }).then(function (result) {
            // console.log("data inserted");
            fileId = result[0];
        })
            .catch((err) => {
                success = false;
                console.log(err);
                throw err
            });

        return {
            "file_id": fileId,
            "image": await this.getImage(options.knex, fileId)
        }

    },
    uploadFile: async function (options) {

        // let sampleOptions = {
        //     knex: knexdb,
        //     base64_data: thebase64code,
        //     file_name: "test.jpg",
        //     user_id: 154 // optional
        // };



        let mimeType = mime.lookup(options.file_name);
        let imageData = options.base64_data;

        if (imageData.includes(',')) {
            imageData = imageData.split(',')[1];
        }

        var img = new Buffer(imageData, 'base64');

        // var resized_small_data_base64, resized_medium_data_base64, resized_large_data_base64;


        // do the upload
        var upload_file_response = await this.uploadFile(options.knex, "audio", imageData, options.file_name);

        var original_url = upload_file_response;


        var fileId;
        await options.knex('files').insert({
            'user_id': options.user_id,
            'type': "audio",
            's3_original_path': original_url,
            'time': Date.now() / 1000
        }).then(function (result) {
            console.log("data inserted");
            fileId = result[0];
        })
            .catch((err) => {
                success = false;
                console.log(err);
                throw err
            });

        return {
            "file_id": fileId,
            "file": await this.getFile(options.knex, fileId)
        }

    },

    upload: async function (knex, folderName, base64, fileName) {

        var success = true;

        // generate unique file name
        var fixedFileName = moment().unix() + '_' + Math.floor(getRandomArbitrary(0, 1000)) + '_' + fileName;

        // create buffer from the base64
        var fileBuffer = Buffer.from(base64, 'base64');

        // prepare data for AWS S3
        var mimeType = mime.lookup(fileName);
        // if(folderName == 'audio') {
        //     mimeType = 'audio/webm';
        // }

        var data = {
            Key: folderName + "/" + fixedFileName,
            Body: fileBuffer,
            ACL: 'public-read',
            // ContentEncoding: 'base64',
            ContentType: mimeType
        };

        var fileId = 0;
        var returnData = {};

        // Send the file to S3
        await s3Bucket.putObject(data, function (err, data) {
            if (err) {
                console.log(err);
                console.log('Error uploading data: ', data);
                success = false;
            } else {
                console.log('succesfully uploaded the image!: ' + fixedFileName);

            }
        }).promise();

        var fileUrl = 'https://basma-files.s3.me-south-1.amazonaws.com/' + folderName + '/' + fixedFileName;

        console.log("hello: " + fileUrl);

        return fileUrl;




    }
}
