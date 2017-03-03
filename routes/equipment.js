var express = require('express');
var router = express.Router();
var Controller = require(__base + 'models/controller');
var Component = require(__base + 'models/component');
var isAuthenticated = require(__base + 'helpers/is-authenticated');
router.get('/', isAuthenticated, function (req, res, next) {
    res.render('equipment/index', {title: 'Demo Dashboard'});
});
router.get('/addcomponent/:buildingid', isAuthenticated, function (req, res, next) {
    var buildingiId = req.params.buildingid;
    Controller.find({'building_id': buildingiId}).populate('inputs.type').then(function (controllers) {

        Component.find({'building_id': buildingiId}).then(function (components) {

            res.render('equipment/addcomponent', {title: 'Demo Dashboard', controllers: controllers, components: components, buildingid: buildingiId});
        });
    });
});
router.get('/getinoutforcontroller', function (req, res, next) {

    var controllerId = req.query.controllerid;
    Controller.findOne({'_id': controllerId}).then(function (controller) {

        var inoout = new Array();
        controller.inputs.forEach(function (item) {
            inoout.push({name: item.name, id: item._id, type: 'input'});
        });
        controller.outputs.forEach(function (item) {
            inoout.push({name: item.name, id: item._id, type: 'output'});
        });
        res.json(inoout);
    });
});
router.get('/addnewcomponent', function (req, res, next) {
    var buildingId = req.query.buildingid;
    var componentId = req.query.controllerId;
    console.log('typee:' + req.query.type);
    if (componentId != undefined) {

        Component.findOne({'_id': componentId}).then(function (controller) {

        });
    } else {

        var component = new Component({
            name: req.query.componentname,
            controller_id: req.query.controllerid,
            inout_id: req.query.inoutid,
            building_id: buildingId,
            componentid: req.query.componentid,
            type: req.query.type,
            left: 0 + 'px',
            top: 0 + 'px'
        });
        component.save().then(function (component) {
            res.json(component._id);
            console.log('Component saved successfully!');
        });
    }
});
router.get('/updatecomponentaxis', function (req, res, next) {
    var componentId = req.query.componentid;
    console.log(componentId + 'sss');
    Component.findOne({'_id': componentId}, function (err, component) {
        component.top = req.query.top;
        component.left = req.query.left;
        component.save();
    });
    res.json("sucess");
});

router.get('/deletecomponent', function (req, res, next) {
    var componentId = req.query.componentid;
    Component.findOne({'_id': componentId}, function (err, component) {
        if (component != 'undefined' && component != null)
        {
            component.remove();
        }
        res.json("sucess");
    });
});

router.get('/getinputreading', function (req, res, next) {

    var inputid = req.query.inputid;
    Controller.findOne({'inputs._id': inputid}).populate('inputs.type').then(function (controller) {
        var inputDevice;
        if (controller != null)
        {
            controller.inputs.forEach(function (input) {

                if (input._id == inputid)
                {
                    inputDevice = input;
                }

            });
        }
        res.json(inputDevice);
        // res.json(controller);
    });
});

router.get('/getComponentDetailsById', function (req, res, next) {
    console.log(req.query.componentId)
    var componentId = req.query.componentId;
    Component.findOne({'_id': componentId}).populate('controller_id').then(function (component) {
        // var xx= Component.controller_id.inputs.id(component._id);
        Controller.findOne({'_id': component.controller_id._id}).populate('controller_id').then(function (controller) {
            var data = null;
            if (component.type == 'input')
            {
                data = controller.inputs.id(component.inout_id);
            } else
            {
                data = controller.outputs.id(component.inout_id);
            }
            res.json({inoutData: data, controller: controller});
        });

    });
});



module.exports = router;
