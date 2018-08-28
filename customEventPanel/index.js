define(function (require, exports, module) {
    var portal = {
        init: function (e) {
            portal.initTable();
            portal.bindEvent();
        },

        initTable: function () {
            $("#eventTable").bootstrapTable("destroy");
            $("#eventTable").bootstrapTable({
                url: "/vesapp/custom/event/getListPage.do",
                method: "post",
                cache: false,
                class: "table table-hover",
                queryParamsType: "",
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
                queryParams: function (e) {
                    var params = {};
                    params.page = e.pageNumber;
                    params.rows = e.pageSize;
                    params.startRow = (e.pageNumber - 1) * e.pageSize;
                    params.rowCount = e.pageSize;
                    params.order = e.sortOrder;
                    params.sort = 1;
                    return params;
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
                    width: "40px"
                },
                    {
                        field: "name",
                        title: "事件名称",
                        align: "left",
                        width: "150px",
                        valign: "middle",
                        formatter: function (value, row) {
                            var icon="";
                            if(row.level=="CRITICAL"){
                                icon="res_critical";
                            }else if(row.level=="SERIOUS"){
                                icon="res_serious";
                            }else if(row.level=="WARN"){
                                icon="res_warn";
                            }
                            return '<p class="white" data-toggle="modal" >' +
                                '<span title="' + row.name + '">' + ves.icon(icon) + row.name + ' </span></p>';
                        }
                    },
                    {
                        field: "level",
                        title: "告警级别",
                        align: "left",
                        width:"150px",
                        valign: "middle",
                        formatter: function (value, row, rowIndex) {
                            if(value=="CRITICAL"){
                                return "致命"
                            }else if(value=="SERIOUS"){
                                return "严重"
                            }else if(value=="WARN"){
                                return "警告"
                            }
                        }
                    }, {
                        field: "createUser",
                        title: "创建人",
                        align: "left",
                        width:"150px",
                        valign: "middle"
                    }
                    , {
                        field: "createTime",
                        title: "创建时间",
                        align: "left",
                        width:"150px",
                        valign: "middle",
                        formatter: function (value, row, rowIndex) {
                            Date.prototype.toLocaleString = function () {
                                return this.getFullYear() + "年" + (this.getMonth() + 1) + "月" + this.getDate() + "日 " + this.getHours() + "点" + this.getMinutes() + "分";
                            };
                            var createTime = new Date(value).toLocaleString();
                            return createTime;
                        }
                    },{
                        field: "remark",
                        title: "事件描述",
                        align: "left",
                        width: "400px",
                        valign: "middle"
                    }
                ]
            });
        },

        initdia: function (type, data) {

            var dlg = $('<div/>');
            dlg.dialog({
                href: '/ves/resource/resPanel/customEventPanel/customEventDialog/index.html',
                title: ((type == 'add') ? "添加" : "编辑") + "自定义事件",
                height: 530,
                width: 1000,
                buttons: [{
                    text: "确定",
                    handler: function () {
                        dlg.window("close");
                        $("#eventTable").bootstrapTable('refresh');
                    }
                }],
                onLoad: function () {
                    ves.getIndexJS("/ves/resource/resPanel/customEventPanel/customEventDialog/", function (s) {
                        s.init(type, data);
                    });
                }
            });
        },

        bindEvent: function (type) {
            $("#addEventBtn").unbind("click").on("click", function () {
                portal.initdia("add", null);
            });

            $("#editEventBtn").unbind("click").on("click", function () {
                var selects = $("#eventTable").bootstrapTable("getSelections");
                if (selects.length < 1) {
                    alert("请勾选要编辑的数据");
                }
                else if (selects.length == 1) {
                    portal.initdia("edit", selects);
                }
                else {
                    alert("一次只能编辑一条数据");
                }
            });

            $("#delEventBtn").unbind("click").on("click", function () {
                var selectDelIds = ves.btConfirmIds($("#eventTable"));
                if (selectDelIds.length < 1) {
                    alert("请勾选要删除的数据")
                } else {
                    if (confirm("确定要删除吗？") == true) {
                        $.ajax({
                            url: "/vesapp/custom/event/delete.do?id=" + selectDelIds.toString(),
                            type: 'get',
                            async: true,
                            success: function () {
                                $("#eventTable").bootstrapTable('refresh');
                                alert("删除成功");
                            }
                        });
                    }
                }
            });
        }
    };

    return portal;

});