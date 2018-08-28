define(function (require, exports, module) {
    var conts = require("/ves/resource/resPanel/conts.js");
    var portal = {
        init: function (e) {
            portal.initTable();
            portal.bindEvent();
        },

        initTable: function () {
            const $columns = [{
                filed: "",
                checkbox: true,
                width: "40px"
            },{
                    field: "name",
                    title: "基线名称",
                    align: "left",
                    width: "15%",
                    valign: "middle"
                }, {
                    field: "type",
                    title: "基线类型",
                    align: "left",
                    width: "13%",
                    valign: "middle",
                    formatter:function (value,row,index) {
                        if(value=="D"){
                            return "日基线";
                        }
                        return "周基线";
                    }
                },{
                field: "createUser",
                title: "创建人",
                align: "left",
                width: "13%",
                valign: "middle"
            },{
                field: "createTime",
                title: "创建时间",
                align: "left",
                width: "20%",
                valign: "middle",
                formatter: function (value, row, rowIndex) {
                    Date.prototype.toLocaleString = function () {
                        return this.getFullYear() + "年" + (this.getMonth() + 1) + "月" + this.getDate() + "日 " + this.getHours() + "点" + this.getMinutes() + "分";
                    };
                    var createTime = new Date(value).toLocaleString();
                    return createTime;
                }
            }, {
                    field: "remark",
                    title: "基线描述",
                    align: "left",
                    valign: "middle"
                }
            ];
            const url = "/vesapp/intelligent/getListPage.do";
            var tabel = $("#helloword");
            conts.initGrid(tabel, 'post', url, $columns, function (e) {
                var params = {};
                params.page = e.pageNumber;
                params.rows = e.pageSize;
                params.startRow = (e.pageNumber - 1) * e.pageSize;
                params.rowCount = e.pageSize;
                params.order = e.sortOrder;
                params.sort = 1;
                return params;
            }, true);
        },

        _openDialog: function (type, data) {
            var dlg = $('<div/>');
            dlg.dialog({
                href: '/ves/resource/resPanel/intelligentPanel/intelligentDialog/index.html',
                title: ((type == 'add') ? "添加" : "编辑") + "智能基线",
                height: 530,
                width: 1000,
                buttons: [{
                    text: "确定",
                    handler: function () {
                        dlg.window("close");
                        $("#helloword").bootstrapTable('refresh');
                    }
                }],
                onLoad:function () {
                    ves.getIndexJS("/ves/resource/resPanel/intelligentPanel/intelligentDialog/", function (s) {
                        s.init(type, data);
                    });
                }
            });
        },

        bindEvent: function () {
            var _sef = this;
            $("#addEventBtn").unbind("click").on("click", function () {
                _sef._openDialog("add", "add");
            });

            $("#editEventBtn").unbind("click").on("click", function () {
                var selects = $("#helloword").bootstrapTable("getSelections");
                if (selects.length < 1) {
                    alert("请勾选要编辑的数据");
                }
                else if (selects.length == 1) {
                    _sef._openDialog("edit", selects)
                }
                else {
                    alert("一次只能编辑一条数据")
                }
            });

            //删除
            $(".del-btn").unbind("click").on("click", function () {
                var id = ves.btConfirmIds($("#helloword"));
                if (id.length < 1) {
                    alert("请勾选要删除的数据")
                } else {
                    $.messager.confirm(
                        '删除提示',
                        "确认删除该基线吗？",
                        function (data) {
                            if (data) {
                                $.ajax({
                                    url: "/vesapp/intelligent/delete.do?id=" + id.toString(),
                                    type: "get",
                                    async: false,
                                    dataType: "json",
                                    success: function (data) {
                                        $("#helloword").bootstrapTable('refresh');
                                        alert("删除成功");
                                    }
                                })
                            }
                        }
                    );
                }
            })
        }
    };

    return portal;

});