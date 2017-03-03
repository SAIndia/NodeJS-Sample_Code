var express = require('express');
var router = express.Router();
var User = require(__base + 'models/user');
var InputTypes=require(__base + 'models/inputtypes');
var Building = require(__base + 'models/building');
var Controller = require(__base + 'models/controller');
var isAuthenticated = require(__base + 'helpers/is-authenticated');

router.get('/', isAuthenticated, function(req, res, next) {

    User.find({})
        .then(function(users){
            
            res.render('demo/index', { title: 'Demo Dashboard', data : users});
        });

});

router.get('/list', function(req, res, next) {
//    console.log(req.isAuthenticated());
    res.render('demo/list', { title: 'Demo List' });
});

router.get('/form', function(req, res, next) {
    
    res.render('demo/form', { title: 'Demo Form' });
});

router.get('/add', function(req, res, next) {
    
    var chris = new User({
        name: 'Chris',
        username: 'sevilayha',
        password: 'password' 
    });
    
    chris.save(function(err) {
        if (err) throw err;

        console.log('User saved successfully!');
    });
    
    res.render('demo/index', { title: 'Demo User Added' });
});

router.get('/tree', function(req, res, next) {
    
    Building.find({}, 'name').then(function (buildings) {
        
        var jsTreeData = [],
            buidlingIds = [];

        buildings.forEach(function(building){
            if (typeof building._id !== 'undefined') {

                jsTreeData.push({
                    id          : building._id,
                    parent      : '#',
                    text        : building.name,
                    icon        : 'fa fa-building',

                    state       : {
                        opened    : false,
                        disabled  : false,
                        selected  : false
                    },
                    li_attr     : {},
                    a_attr      : {}
                });

                buidlingIds.push(building._id);
            }
        });
        
        Controller.find({
                building_id : {$in: buidlingIds}
            }, 'name building_id inputs.name outputs.name')
            .then(function (controllers) {

                // Add Controllers
                controllers.forEach(function(controller){
                    
                    if (typeof controller._id !== 'undefined') {
                        
                        jsTreeData.push({
                            id          : controller._id,
                            parent      : controller.building_id,
                            text        : controller.name,
                            icon        : 'fa fa-bolt',
                            state       : {
                                opened    : false,
                                disabled  : false,
                                selected  : false
                            },
                            li_attr     : {},
                            a_attr      : {}
                        });
                    }
                    
                    // Add inputs to tree
                    if (typeof controller.inputs === 'object') {
                        
                        controller.inputs.forEach(function(input, inputKey){
                            
                            jsTreeData.push({
                                id          : controller._id + 'input' + inputKey,
                                parent      : controller._id,
                                text        : input.name,
                                icon        : 'fa fa-download',
                                state       : {
                                    opened    : false,
                                    disabled  : false,
                                    selected  : false
                                },
                                li_attr     : {},
                                a_attr      : {}
                            });
                        });
                    }
                    
                    // Add outputs to tree
                    if (typeof controller.outputs === 'object') {
                        
                        controller.outputs.forEach(function(output, outputKey){
                            
                            jsTreeData.push({
                                id          : controller._id + 'output' + outputKey,
                                parent      : controller._id,
                                text        : output.name,
                                icon        : 'fa fa-upload',
                                state       : {
                                    opened    : false,
                                    disabled  : false,
                                    selected  : false
                                },
                                li_attr     : {},
                                a_attr      : {}
                            });
                        });
                    }
                    
                });
                
                res.render('demo/tree', { title: 'Demo Tree', treeData : jsTreeData });
//                res.json(jsTreeData);
            });
        
        
    });
    
    
    
//    res.json(data);
    
//    res.render('demo/form', { title: 'Demo Form' });
});

router.get('/addinputtype', function(req, res, next) {
    
    var type = new InputTypes({
        type: 'Voltage',
        unit: 'V'
    });
    
    type.save(function(err) {
        if (err) throw err;

        console.log('User saved successfully!');
    });
    
    res.render('demo/index', { title: 'Demo User Added' });
});

module.exports = router;