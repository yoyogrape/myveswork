define(function (require, exports, module) {
    var chooseWidow = {
        echoData: '',
        count:0,
        init: function (type, data) {
            if (type == "add") {
                chooseWidow.echoData = '';
                //初始化表格，
                chooseWidow.tableBootstrapTable();
                chooseWidow.tableResourceChildren();
                chooseWidow.tableIndex();
            } else {
                chooseWidow.echoData = data[0];
                chooseWidow.count=0;
                $("#id").val(chooseWidow.echoData.id);
            }
            chooseWidow.comboboxInit(data);
            chooseWidow.bindEvent();
        },
        tableInit: function () {
            $("#choosedTable").bootstrapTable("load", []);
            $("#tableLeft").bootstrapTable("load", []);
            $("#choosedIndex").bootstrapTable("load", []);
        },
        comboboxInit: function (data) {
            $("#cc1").combobox({
                valueField: 'id',
                textField: 'name',
                url: '/vesapp/report/reportTemplate/getResourceCategoryList.do?type=all',
                onSelect: function (self) {
                    if (self != undefined && self.id !== "default") {
                        chooseWidow.tableBootstrapTable(self);//绘制“选择资源”的表格
                        chooseWidow.tableInit();//清除子表格
                    } else {
                        chooseWidow.tableInit();//清除表格数据
                    }
                },
                loadFilter: function (data) {
                    if (data.code == "200") {
                        var arr = [];
                        data = data.data;
                        if (!data) {
                            data = [];
                        }
                        for (var i = 0, len = data.length; i < len; i++) {
                            var flag = false;
                            for (var j = 0; j < data.length; j++) {
                                if (data[i].id == data[j].id && data[i].pid == data[j].pid) {
                                    continue;
                                }
                                if (data[j].id == data[i].pid) {
                                    flag = true;
                                    break;
                                }
                            }
                            ;
                            if (!flag) {
                                arr.push(data[i]);
                            }

                        }
                        ;

                    } else {
                        arr = [];
                    }
                    arr.unshift({id: "default", name: "请选择资源类型", select: "true"})
                    return arr;
                },
                onLoadSuccess: function () {

                }
            });
            if (data != null) {
                $('#cc1').combobox('select', data[0].resourceType);
                chooseWidow.tableBootstrapTable(1,data);
            }
        },
        tableBootstrapTable: function (param, obj) {
            if (typeof  param == "undefined") {
                $("#tableLeft").bootstrapTable({
                    silent: true,
                    columns: [{
                        checkbox: true,
                    },
                        {
                            field: "discoverIP",
                            title: "IP地址",
                            valign: "middle",
                            width: "50%"
                        }, {
                            field: "showName",
                            title: "资源名称",
                            valign: "middle",
                            width: "50%"
                        }, {
                            field: "id",
                            title: "资源ID",
                            valign: "middle",
                            width: "0"
                        }
                    ]

                });
                $('#tableLeft').bootstrapTable('hideColumn', 'id');
                return;
            }
            ;

            if (chooseWidow.echoData&&chooseWidow.count!=2) {
                param = {id: chooseWidow.echoData.resourceType,type:1};
            }
            $("#tableLeft").bootstrapTable("destroy");
            $("#tableLeft").bootstrapTable({
                url: "/vesapp/report/reportTemplate/getResourceInstanceList.do",
                method: "post",
                striped: true,                      //是否显示行间隔色
                cache: false,                       //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
                pagination: false,
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                sortStable: false,
                dataType: "json",
                silent: true,
                queryParams: {
                    startNum: 0,
                    pageSize: 99999,
                    queryId: param.id,
                    type: param.type,
                    domainId: 1
                },
                clickToSelect: true,
                singleSelect: true,
                responseHandler: function (data) {
                    if (data.code == 200) {
                        if (data.data.length == 0) {
                            $("#choosedTable").bootstrapTable("load", []);
                            $("#choosedIndex").bootstrapTable("load", []);
                        }
                        return data.data;
                    }
                },
                columns: [{
                    checkbox: true,
                },
                    {
                        field: "discoverIP",
                        title: "IP地址",
                        valign: "middle",
                        width: "50%"
                    }, {
                        field: "showName",
                        title: "资源名称",
                        valign: "middle",
                        width: "50%"
                    }, {
                        field: "id",
                        title: "资源ID",
                        valign: "middle",
                        width: "0"
                    }
                ],
                onCheck: function (row) {
                    chooseWidow.tableResourceChildren(row, param.type, obj);
                    chooseWidow.tableIndex(row, param.type, obj);
                },
                onLoadSuccess: function (data) {
                    if (obj && obj.instanceId && typeof obj.instanceId === "number") {
                        $.each(data, function (index, item) {
                            if (item.id === obj.instanceId) {
                                $("#tableLef t").bootstrapTable("checkBy", {field: "id", values: [obj.instanceId]});//回写
                            }
                        })
                    }

                }
            });
            $('#tableLeft').bootstrapTable('hideColumn', 'id');
            $("#tableLeft").on("load-success.bs.table", function (field, value, row, $element) {
                if (chooseWidow.echoData) {
                    $("#tableLeft").bootstrapTable("checkBy", {
                        field: "id",
                        values: [chooseWidow.echoData.resourceId]
                    }).trigger("check");
                }
            });
        },
        tableResourceChildren: function (param, sourceType, obj) {
            if (typeof  param == "undefined") {
                $("#choosedTable").bootstrapTable({
                    columns: [{
                        checkbox: true,
                    },
                        {
                            field: "name",
                            valign: "middle",
                            width: "100%"
                        }
                    ],
                    showHeader: false
                });
                return;
            }

            if (chooseWidow.echoData) {
                param = {id: chooseWidow.echoData.resourceId,type:1};
            }
            $("#choosedTable").bootstrapTable("destroy");
            // $table.bootstrapTable("refreshOptions");
            $("#choosedTable").bootstrapTable({
                url: "/vesapp/resource/resourceTree/getSubInstanceByPid.do?instanceId=" + param.id,
                method: "get",
                striped: true,                      //是否显示行间隔色
                cache: false,                       //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
                pagination: false,
                // search: true,
                dataType: "json",
                silent: true,
                sortable: false,
                showHeader: false,
                singleSelect: true,
                clickToSelect: true,
                responseHandler: function (data) {
                    if (data.code == 200) {
                        data = data.data ? data.data : [];
                        return data;
                    }
                },
                onLoadSuccess: function (data) {
                    if (obj && obj.subInstanceId && typeof obj.subInstanceId === "number") {
                        $.each(data, function (index, item) {
                            if (item.id === obj.subInstanceId) {
                                $("#choosedTable").bootstrapTable("checkBy", {
                                    field: "id",
                                    values: [obj.subInstanceId]
                                });//回写
                            }
                        })
                    }

                },
                columns: [{
                    checkbox: true,
                },
                    {
                        field: "name",
                        valign: "middle",
                        width: "100%"
                    },
                    {
                        field: "id",
                        valign: "middle",
                        width: "100%"
                    }
                ],
                onCheck: function (row) {
                    chooseWidow.tableIndex(row, sourceType, obj);
                },
            });
            $('#choosedTable').bootstrapTable('hideColumn', 'id');
            $("#choosedTable").on("load-success.bs.table", function (field, value, row, $element) {
                if (chooseWidow.echoData) {
                    if (chooseWidow.echoData.childName != "" || chooseWidow.echoData.childId != null) {
                        $("#choosedTable").bootstrapTable("checkBy", {
                            field: "id",
                            values: [chooseWidow.echoData.childId]
                        }).trigger("check");
                    }
                }
            });
        },
        tableIndex: function (param, sourceType, obj) {
            if (typeof param == "undefined") {
                $("#choosedIndex").bootstrapTable({
                    columns: [{
                        checkbox: true,
                    },
                        {
                            field: "name",
                            valign: "middle",
                            width: "100%"
                        }
                    ],
                    showHeader: false
                });
                return;
            }

            $("#choosedIndex").bootstrapTable("destroy");
            $("#choosedIndex").bootstrapTable({
                url: "/vesapp/report/reportTemplate/getMetricListByInstanceId.do",
                method: "post",
                striped: true,                      //是否显示行间隔色
                cache: false,                       //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
                pagination: false,
                singleSelect: true,
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                sortStable: false,
                dataType: "json",
                clickToSelect: false,
                silent: true,
                showHeader: false,
                queryParams: {
                    instanceId: param.id,
                    reportType: sourceType,
                    comprehensiveType: sourceType,
                    instanceIdList: param.id

                },
                oncheck:function () {

                },
                responseHandler: function (data) {
                    if (data.code == 200) {
                        chooseWidow.choosedIndexData = data.data;
                        return data.data;
                    }
                },
                onLoadSuccess: function (data) {
                    if (obj && obj.metricIdsArr && obj.metricIdsArr.length > 0) {
                        $("#choosedIndex").bootstrapTable("checkBy", {field: "id", values: obj.metricIdsArr});
                    }
                },
                columns: [{
                    field: "",
                    checkbox: true,
                    text: "",
                    width: "0"
                },
                    {
                        field: "name",
                        valign: "middle",
                        width: "125px"
                    },
                    {
                        field: "operator",
                        valign: "middle",
                        width: "45px",
                        formatter: function (value, row, index) {
                            var selectId =  param.id + "-" + row.id;
                            return "<select id=\'" + selectId + "\' class='operators'><option value='>' selected='selected'>&gt</option><option value='<'>&lt</option><option value='>='>&gt=</option><option value='<='>&lt=</option></select>";
                        }
                    },
                    {
                        field: "filterValue",
                        valign: "middle",
                        width: "40px",
                        formatter: function (value, row, index) {
                            var filterValue = param.id + row.id;
                            return "<input id=\'" + filterValue + "\' type=\'text\'>";
                        }
                    },
                    {
                        field: "unit",
                        valign: "middle",
                    },
                    {
                        field: "id",
                        valign: "middle",
                        width: "25px",
                    }
                ],
            });
            $('#choosedIndex').bootstrapTable('hideColumn', 'id');

            $("#choosedIndex").on("load-success.bs.table", function (field, value, row, $element) {
                if (chooseWidow.echoData) {
                    $("#choosedIndex").bootstrapTable("checkBy", {
                        field: "id",
                        values: [chooseWidow.echoData.metricId]
                    });
                    var selectMark = "";
                    var filterValue = "";
                    if (chooseWidow.echoData.childId != null) {
                        selectMark = chooseWidow.echoData.childId + "-" + chooseWidow.echoData.metricId;
                        filterValue = chooseWidow.echoData.childId + chooseWidow.echoData.metricId;
                    } else {
                        selectMark = chooseWidow.echoData.resourceId + "-" + chooseWidow.echoData.metricId;
                        filterValue = chooseWidow.echoData.resourceId + chooseWidow.echoData.metricId;
                    }
                    $("#" + selectMark + "").find("option[value='" + chooseWidow.echoData.operator + "']").attr("selected", true);
                    $("input[id='" + filterValue + "']").val(chooseWidow.echoData.filterValue);
                }
            });
            if(chooseWidow.count>1){
                chooseWidow.echoData = '';
            }
            chooseWidow.count++;
        },
        bindEvent: function () {
            //资源搜索框的事件
            $(".search .search-btn").on("click", function () {
                var value = $("#searchVal").val().trim();
                value = new RegExp(value, "gi");
                var data = $("#tableLeft").bootstrapTable("getData");
                $.each(data, function (index, item) {
                    $("#tableLeft").bootstrapTable("hideRow", {index: index});
                    $.each(item, function (key, val) {
                        if (key === "discoverIP" || key == "resourceName" || key == "showName") {
                            if (value.test(val)) {
                                $("#tableLeft").bootstrapTable("showRow", {index: index});
                            }
                        }
                        ;
                    });
                });
            })
        },

    };
    return chooseWidow
})