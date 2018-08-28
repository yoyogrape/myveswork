define(function (require, exports, module) {

    var dia = {
        customID: "",
        init: function (type, data) {
            dia.customID = '';
            if (type == 'edit') {
                dia.editResource(data);
                dia.initALarmRumeTab();
            }
            dia.initResSelectTab();
            dia.initALarmRumeTab();
            this.bindEvent(type);
        },

        editResource: function (data) {
            var editRes = data[0];
            dia.customID = editRes.id;
            $("input[name='eventName']").val(editRes.name);
            $("input[name='eventLevel'][value='" + editRes.level + "']").attr("checked", 'checked');
            $('#createUser').text(editRes.createUser);
            $('#updateUser').text(editRes.updateUser);
            $('#remark').text(editRes.remark);
            Date.prototype.toLocaleString = function () {
                return this.getFullYear() + "年" + (this.getMonth() + 1) + "月" + this.getDate() + "日 " + this.getHours() + "点" + this.getMinutes() + "分";
            };
            var createTime = new Date(editRes.createTime).toLocaleString();
            var updateTime = new Date(editRes.updateTime).toLocaleString();
            $('#updateTime').text(updateTime);
            $('#createTime').text(createTime);
        },
        param: {},
        initResSelectTab: function () {
            if (dia.customID == "") {
                $("#res_selectTab").bootstrapTable({
                    columns: [{
                        checkbox: true,
                        width: "15px"
                    },
                        {
                            title: "资源名称",
                            align: "left",
                            width: "30%",
                            valign: "middle"
                        }, {
                            title: "子资源",
                            align: "left",
                            width: "30%",
                            valign: "middle"
                        }, {
                            title: "指标名称",
                            align: "left",
                            valign: "middle"
                        }
                    ],
                    silent: true
                });
                return;
            }
            var _sef = this;
            $("#res_selectTab").bootstrapTable("destroy");
            $("#res_selectTab").bootstrapTable({
                url: "/vesapp/custom/event/resource/getListPage.do",
                method: "POST",
                pageNumber: 1,
                pageSize: 5,
                pageList: [5, 10, 15],
                locale: 'zh-CN',
                showHeader: true,
                cache: false,
                striped: true,
                clickToSelect: true,
                class: "table table-hover",
                sidePagination: 'server',
                pagination: true,
                queryParams: function (e) {
                    var params = {};
                    params.pageIndex = e.offset / e.limit;     //分页
                    params.pageSize = e.limit;
                    _sef.param.page = e.offset / e.limit;
                    _sef.param.startRow = ((_sef.param.page - 1) < 0 ? 0 : _sef.param.page) * e.limit;
                    _sef.param.rowCount = e.limit;
                    $.extend(params, _sef.param, e);
                    params.condition ? params.condition : (params.condition = {});
                    params.condition.iPorName = e.search;
                    params.condition.customId = dia.customID;
                    return JSON.stringify(params);
                },
                responseHandler: function (result) {
                    var _data = {
                        total: result.data.totalRecord,
                        rows: result.data.rows
                    };
                    return _data;
                },
                columns: [{
                    filed: "",
                    checkbox: true,
                    width: "15px"
                },
                    {
                        field: "resourceName",
                        title: "资源名称",
                        align: "left",
                        width: "25%",
                        valign: "middle"
                    }, {
                        field: "childName",
                        title: "子资源",
                        align: "left",
                        width: "25%",
                        valign: "middle"
                    }, {
                        field: "metricName",
                        title: "指标名称",
                        align: "left",
                        width: "25%",
                        valign: "middle"
                    }, {
                        field: "operator",
                        title: "条件",
                        align: "left",
                        valign: "middle",
                        formatter: function (value, row, index) {
                            if(value==">"){
                                value="大于";
                            }else if(value=="<"){
                                value="小于";
                            }else if(value==">="){
                                value="大等于";
                            }else if(value=="<="){
                                value="小等于";
                            }
                            return ""+value+" "+row.filterValue;
                        }
                    }
                ]
            });
        },
        initChildDia: function (type, data) {
            var dlg = $('<div/>');
            dlg.dialog({
                href: '/ves/resource/resPanel/customEventPanel/customEventDialog/childDialog/index.html',
                title: ((type == 'add') ? "添加" : "编辑") + "资源",
                height: 530,
                width: 940,
                buttons: [{
                    text: (type == 'add') ? "提交" : "保存",
                    handler: function () {
                        var resourceData = $("#tableLeft").bootstrapTable("getSelections")[0];
                        var childResData = $("#choosedTable").bootstrapTable("getSelections")[0];
                        var metricData = $("#choosedIndex").bootstrapTable("getSelections")[0];
                        var resourceType = $('#cc1').combobox('getValue');
                        var getFilterValue = '';
                        var getOperator = '';
                        if (!metricData) {
                            alert("请选择指标！");
                            return;
                        }
                        if (childResData) {
                            getFilterValue = $("input[id='" + childResData.id + metricData.id + "']").val();
                            getOperator = $("#" + childResData.id + "-" + metricData.id + " option:selected").val();
                        } else {
                            getFilterValue = $("input[id='" + resourceData.id + metricData.id + "']").val();
                            getOperator = $("#" + resourceData.id + "-" + metricData.id + " option:selected").val();
                        }

                        if (!resourceData) {
                            alert("请选择资源！");
                            return;
                        } else if (!getFilterValue) {
                            alert("请输入指标范围！");
                            return;
                        } else if (isNaN(getFilterValue)) {
                            alert("标范围只能是数字！");
                            return;
                        }
                        var customEventResource = {
                            id: $("#id").val(),
                            customId: dia.customID,
                            resourceType: resourceType,
                            resourceId: resourceData.id,
                            resourceName: resourceData.resourceName,
                            childId: childResData ? childResData.id : null,
                            childType: childResData ? childResData.childType : null,
                            childName: childResData ? childResData.name : null,
                            metricId: metricData.id,
                            metricName: metricData.name,
                            operator: getOperator,
                            filterValue: getFilterValue,
                            unit: metricData.unit
                        };
                        var url = "/vesapp/custom/event/resource/insert.do";
                        if (type === 'edit') {
                            url = "/vesapp/custom/event/resource/update.do";
                        }
                        $.ajax({
                            url: url,
                            type: 'POST',
                            data: customEventResource,
                            async: false,
                            success: function (result, stat) {
                                if (stat == "success") {
                                    dia.initResSelectTab();
                                }
                                dlg.window("close");
                            }
                        });
                    },
                }],
                onLoad: function () {
                    ves.getIndexJS("/ves/resource/resPanel/customEventPanel/customEventDialog/childDialog/", function (s) {
                        s.init(type, data);
                    });
                }
            });
        },

        initALarmRumeTab: function () {
            if (dia.customID == "") {
                $("#res_alarmRumeTab").bootstrapTable({
                    columns: [{
                        filed: "",
                        checkbox: true,
                        width: "20%"
                    },
                        {
                            field: "userName",
                            title: "接收人员",
                            align: "left",
                            width: "40%",
                            valign: "middle"
                        }, {
                            field: "alarmRulesID",
                            title: "告警方式",
                            align: "left",
                            width: "40%",
                            valign: "middle",
                            formatter: function (value, row, rowIndex) {
                                var messCheckState = "";
                                var emailCheckState = "";
                                var wechartCheckState = "";
                                if (row.haveMess) {
                                    if (true == row.messEnable) {
                                        messCheckState = 'checked="true"';
                                    }
                                } else {
                                    messCheckState = 'class=\"checkbox_disabled\" ';
                                }
                                if (row.haveEmail) {
                                    if (true == row.emailEnable) {
                                        emailCheckState = 'checked="true"';
                                    }
                                } else {
                                    emailCheckState = 'class=\"checkbox_disabled\" ';
                                }
                                if (row.haveWechart) {
                                    if (true == row.wechartEnable) {
                                        wechartCheckState = 'checked="true"';
                                    }
                                } else {
                                    wechartCheckState = 'class=\"checkbox_disabled\" ';
                                }
                                return '<table width="100%"><tr width="100%"><td width="33%"><input type="checkbox"  ' + messCheckState + ' class="alarmCheckBox" name="checkboxMessage" value="' + row.alarmRulesID + '" style="vertical-align:middle;" >&nbsp;&nbsp;<a> 短信&nbsp;&nbsp;</a><a id=' + row.alarmRulesID + ' style="vertical-align:middle;" name="message" class="ico ico-edit lacate-none"></a></td>'
                                    + '<td width="33%"><input type="checkbox"  ' + emailCheckState + ' class="alarmCheckBox" name="checkboxEmail" value="' + row.alarmRulesID + '" style="vertical-align:middle;" >&nbsp;&nbsp;<a>邮件&nbsp;&nbsp;</a><a id=' + row.alarmRulesID + ' style="vertical-align:middle;" name="email"  class="ico ico-edit lacate-none"></a></td>'
                                    + '<td width="34%"><input type="checkbox"   ' + wechartCheckState + ' class="alarmCheckBox" name="checkboxWechart" value="' + row.alarmRulesID + '" style="vertical-align:middle;" >&nbsp;&nbsp;<a>微信&nbsp;&nbsp;</a><a id=' + row.alarmRulesID + ' style="vertical-align:middle;" name="wechart" class="ico ico-edit lacate-none"></a></td></tr></table>';
                            }
                        }
                    ]
                });
                return;
            }
            var _sef = this;
            $("#res_alarmRumeTab").bootstrapTable("destroy");
            $("#res_alarmRumeTab").bootstrapTable({
                url: "/vesapp/resource/rceceiveAlarmQuery/businessProfileAlarmRules.do?profileId=" + dia.customID + "&profileType=customEvent&queryType=allQuery",
                method: "post",
                cache: false,
                pageNumber: 1,
                pageSize: 10,
                pageList: [10, 15, 20],
                locale: 'zh-CN',
                sidePagination: "server",
                striped: true,
                pagination: true,
                dataType: "json",
                silent: true,
                search: false,
                sortable: false,
                showHeader: true,
                singleSelect: false,
                clickToSelect: true,
                responseHandler: function (result) {
                    var _data = {
                        total: result.data.totalRecord,
                        rows: result.data.rows
                    };
                    return _data;
                },
                columns: [{
                    filed: "",
                    checkbox: true,
                    width: "20%"
                },
                    {
                        field: "userName",
                        title: "接收人员",
                        align: "left",
                        width: "40%",
                        valign: "middle"
                    }, {
                        field: "alarmRulesID",
                        title: "告警方式",
                        align: "left",
                        width: "40%",
                        valign: "middle",
                        formatter: function (value, row, rowIndex) {
                            var messCheckState = "";
                            var emailCheckState = "";
                            var wechartCheckState = "";
                            if (row.haveMess) {
                                if (true == row.messEnable) {
                                    messCheckState = 'checked="true"';
                                }
                            } else {
                                messCheckState = 'class=\"checkbox_disabled\" ';
                            }
                            if (row.haveEmail) {
                                if (true == row.emailEnable) {
                                    emailCheckState = 'checked="true"';
                                }
                            } else {
                                emailCheckState = 'class=\"checkbox_disabled\" ';
                            }
                            if (row.haveWechart) {
                                if (true == row.wechartEnable) {
                                    wechartCheckState = 'checked="true"';
                                }
                            } else {
                                wechartCheckState = 'class=\"checkbox_disabled\" ';
                            }
                            return '<table width="100%"><tr width="100%"><td width="33%"><input type="checkbox"  ' + messCheckState + ' class="alarmCheckBox" name="checkboxMessage" value="' + row.alarmRulesID + '" style="vertical-align:middle;" >&nbsp;&nbsp;<a> 短信&nbsp;&nbsp;</a><a id=' + row.alarmRulesID + ' style="vertical-align:middle;" name="message" class="ico ico-edit lacate-none"></a></td>'
                                + '<td width="33%"><input type="checkbox"  ' + emailCheckState + ' class="alarmCheckBox" name="checkboxEmail" value="' + row.alarmRulesID + '" style="vertical-align:middle;" >&nbsp;&nbsp;<a>邮件&nbsp;&nbsp;</a><a id=' + row.alarmRulesID + ' style="vertical-align:middle;" name="email"  class="ico ico-edit lacate-none"></a></td>'
                                + '<td width="34%"><input type="checkbox"   ' + wechartCheckState + ' class="alarmCheckBox" name="checkboxWechart" value="' + row.alarmRulesID + '" style="vertical-align:middle;" >&nbsp;&nbsp;<a>微信&nbsp;&nbsp;</a><a id=' + row.alarmRulesID + ' style="vertical-align:middle;" name="wechart" class="ico ico-edit lacate-none"></a></td></tr></table>';
                        }
                    }
                ]
            });

            $("#res_alarmRumeTab").unbind('load-success.bs.table');
            $("#res_alarmRumeTab").on("load-success.bs.table", function (field, value, row, $element) {
                dia.bindAlarmBtn();
            });
        },
        _openlog: function () {
            var _sef = this;
            var profileId = dia.customID;//策略ID
            var profileType = 'customEvent';
            var domainId = 1;
            var profileNameType = 1;
            var alarmPersonData = $("#res_alarmRumeTab").bootstrapTable("getData");
            var alarmPersonIds = _.map(alarmPersonData, "userID");
            var alarmLevelStr = [{content: '（级别：严重）', level: 'metric_error', checked: true}];
            ves.resource.loadScript('ves/otherPage/receiveAlarmQuery/js/alarmRuleContent.js', function () {
                ves.resource.resource.management.alarmrulecontent.openAdd(profileNameType, domainId, profileId, profileType, alarmPersonIds, _sef.initALarmRumeTab, alarmLevelStr);
            });
        },
        bindAlarmBtn: function () {
            var _sef = this;
            $('.lacate-none').on('click', function (e) {
                var jObj = $(e.target);
                var openState = 1;
                var alarmLevelStr = [{content: '（级别：严重）', level: 'metric_error', checked: true}];
                ves.resource.loadScript('ves/otherPage/receiveAlarmQuery/js/alarmRulesSet.js', function () {
                    ves.resource.management.alarmrulesset.open(jObj.attr('id'), jObj.attr('name'), _sef.initALarmRumeTab, "customEvent", alarmLevelStr, openState);
                });
            });
        },

        regForm: function () {

            var name = $("input[name='eventName']").val();
            if (name == '') {
                $("#nameText").text("请填写事件名称！");
                return false;
            } else {
                $("#nameText").text("");
            }
            return true;
        },
        bindEvent: function (type) {
            $("#res_saveBtn").unbind("click").on("click", function () {
                if (!dia.regForm()) {
                    return;
                }
                var resInfo = {
                    name: $("input[name='eventName']").val(),
                    level: $("input:radio[name='eventLevel']:checked").val(),
                    remark: $("#remark").val()
                }
                var customURL = "/vesapp/custom/event/insert.do";
                if (type === 'edit') {
                    customURL = "/vesapp/custom/event/update.do";
                    resInfo = $.extend(resInfo, {id: dia.customID});
                }
                $.ajax({
                    url: customURL,
                    type: 'post',
                    data: resInfo,
                    async: true,
                    dataType: 'json',
                    success: function (data, status) {
                        if (status == "success") {
                            if (type === 'add') {
                                dia.customID = data.data;
                            }
                            dia.initResSelectTab(dia.customID);
                            dia.initALarmRumeTab();
                            $("#eventTable").bootstrapTable('refresh');
                            alert("保存成功！");
                        } else {
                            alert("保存失败！");
                        }

                    }
                });
            });

            $("#res_addEventBtn").unbind("click").on("click", function () {
                if (dia.customID == "") {
                    alert("请先填写基本信息并保存");
                    return;
                }
                dia.initChildDia("add", null);
            });

            $("#res_editEventBtn").unbind("click").on("click", function () {
                if (dia.customID == "") {
                    alert("请先填写基本信息并保存");
                    return;
                }
                var selects = $("#res_selectTab").bootstrapTable("getSelections");
                if (selects.length < 1) {
                    alert("请勾选要编辑的数据");
                }
                else if (selects.length == 1) {
                    dia.initChildDia("edit", selects);
                }
                else {
                    alert("一次只能编辑一条数据")
                }
            });

            $("#res_delEventBtn").unbind("click").on("click", function () {
                if (dia.customID == "") {
                    alert("请先填写基本信息并保存");
                    return;
                }
                var selectDelIds = ves.btConfirmIds($("#res_selectTab"));
                if (selectDelIds.length < 1) {
                    alert("请勾选要删除的数据")
                } else {
                    if (confirm("确定要删除吗？") == true) {
                        $.ajax({
                            url: "/vesapp/custom/event/resource/delete.do?id=" + selectDelIds.toString(),
                            type: 'get',
                            async: true,
                            success: function () {
                                $("#res_selectTab").bootstrapTable('refresh');
                                alert("删除成功");
                            }
                        });
                    }
                }
            });


            var _sef = this;
            $('#res_addAlarmRumeTabBtn').on('click', function () {
                if (dia.customID == "") {
                    alert("请先填写基本信息并保存");
                    return;
                }
                _sef._openlog();
            });
            $("#res_delalarmRumeTabBtn").unbind("click").on("click", function () {
                if (dia.customID == "") {
                    alert("请先填写基本信息并保存");
                    return;
                }
                var id = $("#res_alarmRumeTab").bootstrapTable('getAllSelections');
                if (id.length < 1) {
                    alert("请勾选要删除的数据")
                } else {
                    $.messager.confirm(
                        '删除提示',
                        "确认删除该规则吗？",
                        function (data) {
                            if (data) {
                                $.ajax({
                                    url: "/vesapp/resource/rceceiveAlarmQuery/deleteAlarmRule.do",
                                    type: "post",
                                    data: {ruleId: _.map(id, "alarmRulesID").toString()},
                                    dataType: "json",
                                    success: function (data) {
                                        $("#res_alarmRumeTab").bootstrapTable('refresh');
                                        alert("删除成功");
                                    }
                                })
                            }
                        }
                    );
                }
            });

        }
    };
    return dia;
})
;