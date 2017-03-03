function pad(n, width, z)
{
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function createReadNodes(controller)
{
    var httpRequestNodeId = '27a1646b.fbe944';
    var inputNodes = [];
    var nodeYPosition = 0;
    
    if (typeof controller.inputs !== 'undefined') {
        
        for(var i = 0; i < controller.inputs.length; i++) {

            var input = controller.inputs[i];
            var inputType = input.type;
            var readNodeId = "e5035474." + pad(i, 6);
            var functionNodeId = "486b297a." + pad(i, 6);
            nodeYPosition = i * 50;

            var readNode = {
                id: readNodeId,
                type: "readUI",
                z: "abdf6d73.54299",
                name: input.name,
                module: input.module,
                input: input.input,
                uitype: inputType.node_red_uitype_id,
                unit: inputType.node_red_unit_id,
                scan: input.interval,
                x: 100,
                y: nodeYPosition,
                wires: [
                    [
                        functionNodeId
                    ]
                ]
            };
            
            var formatRequestFunctionNode = {
                id: functionNodeId,
                type: "function",
                z: "abdf6d73.54299",
                name: "format request",
                func: 'msg.payload = {\n    "controller" : "' + controller._id + '",\n    "topic" : msg.topic,\n    "input": "' + input.input + '",\n    "module" : "' + input.module + '",\n    "value" : msg.payload\n}\nreturn msg;',
                outputs: 1,
                noerr: 0,
                x: 400,
                y: nodeYPosition,
                wires: [
                    [
                        httpRequestNodeId
                    ]
                ]
            };
            
            inputNodes.push(readNode);
            inputNodes.push(formatRequestFunctionNode);
        }
    }
    
    var httpRequestNode = {
        id: httpRequestNodeId,
        type: "http request",
        z: "abdf6d73.54299",
        name: "",
        method: "POST",
        ret: "txt",
		url: "http://192.168.0.124:3000/node-red-api/save-reading",
//      url: "http://192.168.0.235:3001/node-red-api/save-reading",
        tls: "",
        x: 700,
        y: Math.floor(nodeYPosition / 2),
        wires: [
            []
        ]
    };
    
    inputNodes.push(httpRequestNode);
    
    return inputNodes;
}

function createWriteNodes(controller)
{
    var writeNodes = [];
//    console.log(typeof controller.inputs.length);
    var nodeYStartPosition = typeof controller.inputs.length === 'number' ? controller.inputs.length * 50 + 100 : 0;
    
    if (typeof controller.outputs !== 'undefined') {
        
        for(var i = 0; i < controller.outputs.length; i++) {
            
            var output = controller.outputs[i],
                nodeIdPad = pad(i, 6),
                httpResponseNodeId = 'cdbfbfb.' + nodeIdPad,
                httpInNodeId = 'cc163484' + nodeIdPad,
                verifyKeyFunctionNodeId = 'beac0416' + nodeIdPad,
                verifyInputFunctionNodeId = '2f25339e' + nodeIdPad,
                writeNodeId = '46b07f54' + nodeIdPad;
                
            var nodeYPosition = nodeYStartPosition + i * 100;
            
            var httpResponseNode = {
                id: httpResponseNodeId,
                type: "http response",
                z: "abdf6d73.54299",
                name: "",
                x: 500,
                y: nodeYPosition + 50,
                wires: []
            };
            
            var httpInNode = {
                id: httpInNodeId,
                type: "http in",
                z: "abdf6d73.54299",
                name: "",
                url: "/write" + output.module + output.output,
                method: "post",
                swaggerDoc: "",
                x: 100,
                y: nodeYPosition,
                wires: [
                    [
                        verifyKeyFunctionNodeId
                    ]
                ]
            };
            var verifyKeyFunctionNode = {
                id: verifyKeyFunctionNodeId,
                type: "function",
                z: "abdf6d73.54299",
                name: "verify key",
                func: "var key = \"0123esd\";\nvar controllerid = \"" + controller._id + "\";\nvar tocompare = \"Basic \" + new Buffer(controllerid +\":\"+key).toString('base64');\n    \nif(!msg.req.headers.authorization || msg.req.headers.authorization!=tocompare){\n    msg.payload = \"Invalid auth header: need:\"+tocompare+\"got:\"+msg.req.headers.authorization;\n    msg.statusCode = 403;\n    return [null,msg];    \n}\nreturn msg;",
                outputs: "2",
                noerr: 0,
                x: 300,
                y: nodeYPosition,
                wires: [
                    [
                        verifyInputFunctionNodeId
                    ],
                    [
                        httpResponseNodeId
                    ]
                ]
            };
            
            var verifyInputFunctionNode = {
                id: verifyInputFunctionNodeId,
                type: "function",
                z: "abdf6d73.54299",
                name: "verify input to writeDO",
                func: "//check value request parameter : url?value=10\nvar value = parseFloat(msg.payload.value);\nvar nmsg = {};\n//do validations\nif(!isNaN(value) && (value== 1 || value === 0)){\n    nmsg.payload = value;\n}\nelse {\n    msg.payload = \"Invalid parameter passed to write\";\n    msg.statusCode = 400;\n    return [null,msg];\n}\n\nreturn [nmsg,msg];",
                outputs: 2,
                noerr: 0,
                x: 500,
                y: nodeYPosition,
                wires: [
                    [
                        writeNodeId
                    ],
                    [
                        httpResponseNodeId
                    ]
                ]
            };
            
            var writeNode = {
                id: writeNodeId,
                type: output.type == 1 ? "writeUO" : "writeDO",
                z: "abdf6d73.54299",
                name: output.name,
                module: output.module,
                output: output.output,
                x: 800,
                y: nodeYPosition,
                wires: [
                    [
                        // "751f8c1d.d8508c" // to debug node
                    ]
                ]
            };
            
            
            writeNodes.push(httpResponseNode);
            writeNodes.push(httpInNode);
            writeNodes.push(verifyKeyFunctionNode);
            writeNodes.push(verifyInputFunctionNode);
            writeNodes.push(writeNode);
        }
    }
    
    return writeNodes;
}

function createImportFlow(controller)
{
    var readNodeFlow = createReadNodes(controller);
    var writeNodeFlow = createWriteNodes(controller);
    
    return readNodeFlow.concat(writeNodeFlow);
}

module.exports = {
    create: createImportFlow
};