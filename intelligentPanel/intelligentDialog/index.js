define(function (require, exports, module) {
    var conts = require("/ves/resource/resPanel/conts.js");
    var dia = {
        intelligentId:"",
        intelligentType: "",
        init: function (type, data) {
            dia.intelligentId ='';
            if (type == 'edit') {
                dia.editResource(data);
                dia.initALarmRumeTab();
            }
            dia.initResSelectTab();
            dia.initALarmRumeTab();
            this.bindEvent(type);
        },

        param : {},
        editResource: function (data) {
            var editRes = data[0];
            dia.intelligentId=editRes.id;
            dia.intelligentType=editRes.type;
            $("input[name='intelligentName']").val(editRes.name);
            $("input[name='baselineType'][value='" + editRes.type + "']").attr("checked", 'checked');
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
        initResSelectTab: function () {
            if (dia.intelligentId == "") {
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
                url: "/vesapp/intelligent/resource/getListPage.do",
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
                    _sef.param.startRow = ((_sef.param.page - 1) < 0 ? 0 :_sef.param.page) * e.limit;
                    _sef.param.rowCount = e.limit;
                    $.extend(params, _sef.param, e);
                    params.condition?params.condition:(params.condition={});
                    params.condition.intelligentId=dia.intelligentId;
                    params.condition.iPorName = e.search;
                    return JSON.stringify(params);
                },
                responseHandler: function (result) {
                    var _data = {
                        total:result.data.totalRecord,
                        rows:result.data.rows
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
                        width: "30%",
                        valign: "middle"
                    }, {
                        field: "childName",
                        title: "子资源",
                        align: "left",
                        width: "30%",
                        valign: "middle"
                    }, {
                        field: "metricName",
                        title: "指标名称",
                        align: "left",
                        valign: "middle"
                    }, {
                        field: "state",
                        title: "状态",
                        align: "left",
                        valign: "middle",
                        formatter:function (value,row,index) {
                            if(row.state === 'FIN'){
                                return '<a data-id="'+row.id+'" class="queryInfo">查看</a>';
                            }else if(row.state === 'WAT'){
                                return '<a data-id="'+row.id+'" class="queryInfo">待生成</a>';
                            }
                            return '<span data-id="0">未知</span>';
                        }
                    }
                ]
            });

            $("#res_selectTab").unbind('load-success.bs.table');
            $("#res_selectTab").on("load-success.bs.table", function (field, value, row, $element) {
                _sef.bindResourceBtn();
            });
        },
        bindResourceBtn:function(){
            var _sef = this;
            $('.queryInfo').unbind('click');
            $('.queryInfo').on('click',function(e){
                var $thisId = $(e.target).attr('data-id');
                _sef.initLineInfoDia($thisId);
            });

        },
        initLineInfoDia: function (id) {

            var dlg = $('<div/>');
            dlg.dialog({
                href: '/ves/resource/resPanel/intelligentPanel/intelligentDialog/lineInfoDialog/index.html',
                title: "查看基线",
                height: 530,
                width: 940,
                buttons: [{
                    text: "确定",
                    handler: function () {
                        // $.ajax({
                        //     url: url,
                        //     type: 'POST',
                        //     data: obj,
                        //     async: true,
                        //     success: function (result) {
                        //         dlg.window("close");
                        //         $("#eventTable").bootstrapTable('refresh');
                        //     }
                        // });
                        dlg.window("close");
                    }
                }]
            });
            setTimeout(function(){
                ves.getIndexJS("/ves/resource/resPanel/intelligentPanel/intelligentDialog/lineInfoDialog/", function (info) {
                    info.init(id);
                });
            },500);
        },

        initALarmRumeTab: function () {
            if (dia.intelligentId == "") {
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
                        }
                    ],
                    silent: true
                });
                return;
            }
            var _sef = this;
            $("#res_alarmRumeTab").bootstrapTable("destroy");
            $("#res_alarmRumeTab").bootstrapTable({
                url: "/vesapp/resource/rceceiveAlarmQuery/businessProfileAlarmRules.do?profileId="+dia.intelligentId+"&profileType=intelligentLine&queryType=allQuery",
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
            var profileId = dia.intelligentId;//策略ID
            var profileType = 'intelligentLine';
            var domainId = 1;
            var profileNameType = 1;
            var alarmPersonData = $("#res_alarmRumeTab").bootstrapTable("getData");
            var alarmPersonIds = _.map(alarmPersonData,"userID");
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
                    ves.resource.management.alarmrulesset.open(jObj.attr('id'), jObj.attr('name'), _sef.initALarmRumeTab, "intelligentLine", alarmLevelStr, openState);
                });
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
                    text: (type == 'add') ? "提交" : "确定",
                    handler: function () {
                        var resourceData = $("#tableLeft").bootstrapTable("getSelections")[0];
                        var childResData = $("#choosedTable").bootstrapTable("getSelections")[0];
                        var metricData = $("#choosedIndex").bootstrapTable("getSelections")[0];
                        var resourceType = $('#cc1').combobox('getValue');
                        if (!resourceData) {
                            alert("请选择资源！");
                            return;
                        } else if (!metricData) {
                            alert("请选择指标！");
                            return;
                        }
                        var getTolerance = '';
                        var getLevel = '';
                        var getAlarmCount = '';
                        if (childResData) {
                            getTolerance = $("input[id='" + childResData.id + metricData.id + "']").val();
                            getLevel = $("#" + childResData.id + "-" + metricData.id + " option:selected").val();
                            getAlarmCount = $("input[id='_" + childResData.id + metricData.id + "']").val();
                        } else {
                            getTolerance = $("input[id='" + resourceData.id + metricData.id + "']").val();
                            getLevel = $("#" + resourceData.id + "-" + metricData.id + " option:selected").val();
                            getAlarmCount = $("input[id='_" + resourceData.id + metricData.id + "']").val();
                        }

                        if (!getTolerance) {
                            alert("请输入容忍度！");
                            return;
                        } else if (isNaN(getTolerance)) {
                            alert("容忍度只能是数字！");
                            return;
                        }else  if (!getAlarmCount) {
                            alert("请填写报警次数！");
                            return;
                        }
                        var intelligentResource = {
                            intelligentId:dia.intelligentId,
                            resourceType: resourceType,
                            resourceId: resourceData.id,
                            resourceName: resourceData.resourceName,
                            childId: childResData ? childResData.id : null,
                            childType: childResData ? childResData.childType : null,
                            childName: childResData ? childResData.name : null,
                            metricId: metricData.id,
                            metricName: metricData.name,
                            level: getLevel,
                            tolerance: getTolerance,
                            unit: metricData.unit,
                            type:dia.intelligentType,
                            alarmCount:getAlarmCount
                        };
                        var url = "/vesapp/intelligent/resource/insert.do";
                        if (type === 'edit') {
                            url = "/vesapp/intelligent/resource/update.do";
                            $.extend(intelligentResource, {id: $('#id').val()}, true);
                        }
                        $.ajax({
                            url: url,
                            type: 'POST',
                            data: intelligentResource,
                            async: false,
                            dataType:"json",
                            success: function (result, stat) {
                                if (stat == "success") {
                                    dia.initResSelectTab();
                                    alert("添加成功");
                                }
                                dlg.window("close");
                            }
                        });
                    },
                }],
                onLoad: function () {
                    ves.getIndexJS("/ves/resource/resPanel/intelligentPanel/intelligentDialog/childDialog/", function (s) {
                        s.init(type,data);
                    });
                }
            });
        },
        regForm: function () {
            var name = $("input[name='intelligentName']").val();
            if (name == '') {
                $("#nameText").text("请填写基线名称！");
                return false;
            } else {
                $("#nameText").text("");
            }
            return true;
        },
        bindEvent: function (type) {
            $("#res_saveBtn").unbind("click").on("click", function () {
                if (!dia.regForm()) {
                    alert("请填写基线名称");
                    return;
                }
                dia.intelligentType=$("input:radio[name='baselineType']:checked").val();
                var resInfo = {
                    name: $("input[name='intelligentName']").val(),
                    type:dia.intelligentType,
                    remark: $("#remark").val()
                };
                var customURL = "/vesapp/intelligent/insert.do";
                if (type === 'edit') {
                    customURL = "/vesapp/intelligent/update.do";
                    resInfo = $.extend(resInfo, {id:dia.intelligentId});
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
                                dia.intelligentId = data.data;
                            }
                            dia.initResSelectTab();
                            dia.initALarmRumeTab();
                            $("#helloword").bootstrapTable('refresh');
                            alert("保存成功");
                        }
                    }
                });
            });

            $("#res_addEventBtn").unbind("click").on("click", function () {
                if(dia.intelligentId==""){
                    alert("请先填写基本信息并保存");
                    return;
                }
                dia.initChildDia("add", null);
            });
            $("#res_editEventBtn").unbind("click").on("click", function () {
                if(dia.intelligentId==""){
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
                if(dia.intelligentId==""){
                    alert("请先填写基本信息并保存");
                    return;
                }
                if(dia.customID==""){
                    alert("请先填写基本信息并保存");
                    return;
                }
                var selectDelIds = ves.btConfirmIds($("#res_selectTab"));
                if (selectDelIds.length < 1) {
                    alert("请勾选要删除的数据")
                } else {
                    if (confirm("确定要删除吗？") == true) {
                        $.ajax({
                            url: "/vesapp/intelligent/resource/delete.do?id=" + selectDelIds.toString(),
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

            $("#res_delalarmRumeTabBtn").unbind("click").on("click", function () {
                if(dia.intelligentId==""){
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
                                    url: "/vesapp/resource/rceceiveAlarmQuery/deleteAlarmRule.do" ,
                                    type: "post",
                                    data: {ruleId: _.map(id,"alarmRulesID").toString()},
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
            var _sef = this;
            $('#res_addAlarmRumeTabBtn').on('click',function(){
                if(dia.intelligentId==""){
                    alert("请先填写基本信息并保存");
                    return;
                }
                _sef._openlog();
            });
        }
    };
    return dia;
})
;