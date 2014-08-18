/*
 * AWS Local Post Handler
 *
 * Author(s):  Kyle Burnett <kburnett@dotdecimal.com>
 *
 * Copyright:  (c) 2014 .decimal, Inc. All rights reserved.
 */

var fs = require('fs');

var ec2 = require('../ec2');

/**
 * Cleans out the request, returning a parameter object
 *
 * @param {object} body - The request body, parsed.
 * @returns {object} A parameter object, which ignores AWS internal fields.
 */
function cleanReq(body) {
    var cleaned = {};
    var ignore = {
        AWSAccessKeyId: true,
        Action: true,
        Signature: true,
        SignatureMethod: true,
        SignatureVersion: true,
        Timestamp: true,
        Version: true
    };

    for (var prop in body) {
        if (!ignore.hasOwnProperty(prop)) {
            cleaned[prop] = body[prop];
        }
    }

    return cleaned;
}

/**
 * Handles the various post actions
 *
 * @param {string} root - The root directory at which to store all persistent AWS data
 * @param {object} lookup - A lookup object which maps each AWS action to a module
 *    and submodule
 */
exports.handler = function(root, lookup) {
    return function(req, res, next) {
        var action = req.body.Action;
        var module = lookup[action].module;
        var subModule = lookup[action].subModule;
        var cleaned = cleanReq(req.body);
        switch(module) {
            case 'ec2':
                ec2[subModule][action](cleaned, res);
                next();
        }
    };
};