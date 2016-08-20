/**
 * Created by igiagante on 18/8/16.
 */


var getAttributesData = function (getAttributesDataCallback) {

    var attrs = [];

    // Effects
    var attr1 = {
        name : 'euphoric',
        type : 'effects',
        percentage : 80
    };

    var attr2 = {
        name : 'relaxed',
        type : 'effects',
        percentage : 70
    };

    var attr3 = {
        name : 'happy',
        type : 'effects',
        percentage : 60
    };

    var attr4 = {
        name : 'uplifted',
        type : 'effects',
        percentage : 50
    };

    var attr5 = {
        name : 'focused',
        type : 'effects',
        percentage : 40
    };

    // Medicinal
    var attr6 = {
        name : 'stress',
        type : 'medicinal',
        percentage : 80
    };

    var attr7 = {
        name : 'depression',
        type : 'medicinal',
        percentage : 70
    };

    var attr8 = {
        name : 'lack of appetite',
        type : 'medicinal',
        percentage : 60
    };

    var attr9 = {
        name : 'nausea',
        type : 'medicinal',
        percentage : 50
    };

    var attr10 = {
        name : 'pain',
        type : 'medicinal',
        percentage : 40
    };

    // Symptoms
    var attr11 = {
        name : 'sleepy',
        type : 'symptoms',
        percentage : 80
    };

    var attr12 = {
        name : 'headache',
        type : 'symptoms',
        percentage : 70
    };

    var attr13 = {
        name : 'muscle spams',
        type : 'symptoms',
        percentage : 60
    };

    var attr14 = {
        name : 'insomnia',
        type : 'symptoms',
        percentage : 50
    };

    var attr15 = {
        name : 'migraine',
        type : 'symptoms',
        percentage : 40
    };

    attrs.push(attr1);
    attrs.push(attr2);
    attrs.push(attr3);
    attrs.push(attr4);
    attrs.push(attr5);
    attrs.push(attr6);
    attrs.push(attr7);
    attrs.push(attr8);
    attrs.push(attr9);
    attrs.push(attr10);
    attrs.push(attr11);
    attrs.push(attr12);
    attrs.push(attr13);
    attrs.push(attr14);
    attrs.push(attr15);

    return getAttributesDataCallback(attrs);
};

module.exports = {
    getAttributesData: getAttributesData
};