define(function (require, exports, module) {
    var conts = require("/ves/resource/resPanel/conts.js");
    var lineInfoWidow = {
        infoData: null,
        initData: function (id) {
            var _sef = this;
            $.ajax({
                url: '/vesapp/intelligent/resource/getById.do?id=' + id,
                async: false,
                success: function (result) {
                    _sef.infoData = result.data;
                }
            });
        },
        showInfoData: function () {
            var _sef = this;
            if (_sef.infoData) {
                var _data = _sef.infoData;
                if (_data.childName !== null && _data.childName !== '') {
                    $('.resourceName').text(_data.resourceName + '-->' + _data.childName + '-->' + _data.metricName);
                } else {
                    $('.resourceName').text(_data.resourceName + '-->' + _data.metricName);
                }
                $('.dayCount').text(_data.dayCount);
                $('.upCount').text(_data.upCount);
                $('.downCount').text(_data.downCount);
            }
        },
        showLineChart: function (id) {
            var _sef = this;
            $.ajax({
                url: '/vesapp/intelligent/resource/getLinesById.do?id=' + id + "&type=",
                async: true,
                success: function (result) {
                    var $result = result.data, $interval = 'auto';
                    if (_sef.infoData.type === 'W') {
                        $interval = 287;
                        _.filter($result, function (item) {
                            if (item.dateType === '1' && item.dateStr === '00:00:00') {
                                return item.dateStr = '周一'
                            } else if (item.dateType === '2' && item.dateStr === '00:00:00') {
                                return item.dateStr = '周二'
                            } else if (item.dateType === '3' && item.dateStr === '00:00:00') {
                                return item.dateStr = '周三'
                            } else if (item.dateType === '4' && item.dateStr === '00:00:00') {
                                return item.dateStr = '周四'
                            } else if (item.dateType === '5' && item.dateStr === '00:00:00') {
                                return item.dateStr = '周五'
                            } else if (item.dateType === '6' && item.dateStr === '00:00:00') {
                                return item.dateStr = '周六'
                            } else if (item.dateType === '7' && item.dateStr === '00:00:00') {
                                return item.dateStr = '周日'
                            }
                        });
                    }
                    var name = _.map($result, "dateStr"), upData = _.map($result, "maxLineValue"),
                        downData = _.map($result, "minLineValue"), metricData = _.map($result, "metricValue");
                    const _o = {
                        grid: {
                            x: 15,
                            y: 35,
                            x2: 25,
                            y2: 25,
                            borderWidth: 0
                        },
                        xAxis: {
                            splitLine: {show: false},
                            axisLabel: {
                                interval: $interval + '',
                                textStyle: {
                                    color: '#ffffff'
                                }
                            },
                            data: name
                        },
                        legend: {
                            data: ['上限', '下限', '指标'],
                            textStyle: {
                                color: '#ffffff'
                            }
                        },
                        series: [
                            {
                                name: '上限',
                                type: 'line',
                                data: upData
                            },
                            {
                                name: '下限',
                                type: 'line',
                                data: downData
                            },
                            {
                                name: '指标',
                                type: 'line',
                                data: metricData
                            }
                        ]
                    };
                    conts.initEcharts(document.getElementById('lineInfoChart'), conts.line, _o);
                }
            });

        },
        init: function (id) {
            var _sef = this;
            _sef.initData(id);//初始化数据
            _sef.showInfoData();
            if ((_sef.infoData.type === 'D' && _sef.infoData.dayCount < 7) ||
                (_sef.infoData.type === 'W' && _sef.infoData.dayCount < 30)) {
                $('#lineInfoChart').hide();
                $('.intelligentProgress').show();
                var count = _sef.infoData.type === 'D' ? 7 : 30,
                    dayCount = _sef.infoData.dayCount === 0 ? 0.05 : _sef.infoData.dayCount;
                $(".intelligentProgressBar").css('width', dayCount / count * 100 + "%");
                $(".intelligentProgressBar").attr('aria-valuenow', dayCount / count * 100);

            } else {
                $('.intelligentProgress').hide();
                $('#lineInfoChart').show();
                _sef.showLineChart(id);
            }


        },

        bindEvent: function () {

        }
    };
    return lineInfoWidow;
});