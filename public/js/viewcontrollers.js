$(function () {
    LoadBuildingTree();

    $('#divtablearea').on("click", "#lnkdelete", function () {
        var controllerId = $(this).data('controllerid');
        var r = confirm("Are you sure to delete ?");
        if (r === true) {
            $.get("deletecontroller", {controllerid: controllerId}, function (data) {
                var nodeId = data;
                $.get("getcontrollerpartialview", {nodeid: nodeId}, function (data) {
                    $('#divtablearea').html(data);
                    $('#dvtree').html('<div id="jstreecontrollers"></div>');
                    LoadBuildingTree();

                });
            });
        }
    });


    $('#divtablearea').on("click", "#lnkviewcontroller", function () {
        var buildingId = $(this).data('buildingid');
        $.get("getcontrollerpartialview", {nodeid: buildingId}, function (data) {
            $('#divtablearea').html(data);
            $("#jstreecontrollers").jstree('close_all');
            $("#jstreecontrollers").jstree("open_node", $("#root"));
            $("#jstreecontrollers").jstree("open_node", $("#" + buildingId));

        });
    });

    $('#divtablearea').on("click", ".lnkviewcontrollerdetail", function () {
        var controllerid = $(this).data('controllerid');
        $.get("../controller/getcontrollerdetails", {controllerid: controllerid}, function (data) {
            $('#divtablearea').html(data);
            $("#jstreecontrollers").jstree("open_node", $("#" + controllerid));

        });
    });

    $('#divtablearea').on("click", ".lnkeditcontroller", function () {
        var controllerid = $(this).data('controllerid');
        $.get("../controller/geteditcontroller", {controllerid: controllerid}, function (data) {
            $('#divtablearea').html(data);
            loadReadyEvents();
            //$("#jstreecontrollers").jstree("open_node", $("#" + controllerid));

        });
    });


});


function  LoadBuildingTree(data) {

    if ($('#jstreecontrollers').length == 0) {
        return false;
    }

    $.get("getbuildingtree", function (data) {

        $('#jstreecontrollers').jstree({
            core: {data: data}
        });

        $('#jstreecontrollers').on("select_node.jstree", function (e, data) {
            var nodeId = data.node.id;
            if (data.node.parent === 'root')
            {
                $.get("getcontrollerpartialview", {nodeid: nodeId}, function (data) {
                    $('#divtablearea').html(data);

                });
            } else if (data.node.parents.length === 3)
            {
                $.get("../controller/getcontrollerdetails", {controllerid: nodeId}, function (data) {
                    $('#divtablearea').html(data);
                    //  $("#jstreecontrollers").jstree("open_node", $("#" + nodeId));

                });
            } else if (data.node.id === 'root')
            {
                $.get("getbuildingpartialview", {nodeid: nodeId}, function (data) {
                    $('#divtablearea').html(data);
                });
            }
        });
    });
}