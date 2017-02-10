var pattern = /(\d{2})\.(\d{2})\.(\d{4})/;
var zoomLevels = [{text: "month"}, {text: "year"}, {text: "decade"}, {text: "century"}];
//var types = ["Area", "StackedArea", "StepLine", "splineArea", "stackedSplineArea", "fullStackedSplineArea", "spline"];
var types = ["splineArea", "spline"];

var trains = [];
var calendar;

var CalcRange = function (dataSource) {
    var minDate;
    var maxDate;

    for (var route of dataSource) {
        var dateStr = route.date;
        var dt = new Date(dateStr.replace(pattern, '$3-$2-$1'));
        if (minDate) {
            if (minDate > dt)
                minDate = dt;
        } else
            minDate = dt;
        if (maxDate) {
            if (maxDate < dt)
                maxDate = dt;
        } else
            maxDate = dt;
    }
    return {"min": minDate, "max": maxDate};
};
var CreateHiddenTrains = function (count) {
    for (var i = 0; i < count; i++) {
        var chartOptions = {
            dataSource: [],
            commonSeriesSettings: {
                type: types[1],
                point: {size: 5},
                argumentField: "date"
            },
            scrollingMode: "all",
            zoomingMode: "all",
            argumentAxis: {
                valueMarginsEnabled: false,
                argumentType: 'datetime',
                tick: {visible: true}
            },
            margin: {
                bottom: 20
            },
            series: [
                {valueField: "Купе", name: "Купе"},
                {valueField: "Плац", name: "Плац"},
                {valueField: "Люкс", name: "Люкс"},
                {valueField: "Мягкий", name: "Мягкий"},
                {valueField: "Сид", name: "Сидячий"},
            ],
            legend: {
                verticalAlignment: "bottom",
                horizontalAlignment: "center"
            },
            scrollBar: {
                visible: true
            },
            onLegendClick: function (series) {
                if (series.target.isVisible())
                    series.target.hide();
                else
                    series.target.show();
            }
        };
        var chart = $("#chart" + i).dxChart(chartOptions).dxChart("instance"); // train._id
        var trainDom = document.getElementById("train" + i);
        trains.push({"chart": chart, "dom": trainDom});
    }
};
var ProcessByHashLocation = function () {
    var dateStr = location.hash.substring(1);
    var dt = new Date(dateStr.replace(pattern, '$3-$2-$1'));
    if (dt != calendar.option("value")) {
        calendar.option("value", dt);
    }
    ProcessDateStr(dateStr);
};
var DrawItem = function (trainObj, index) {
    var tr = trainObj.train;
    var carsHistorical = trainObj.cars[0];
    trains[index].chart.option('dataSource', carsHistorical);
    if (IsMainPage) {
        var time0 = new Date(carsHistorical[Object.keys(carsHistorical)[0]].date);
        var time1 = new Date();
        time1.setTime(time0.getTime() + (4 * 3600000)); // 4 hour
        trains[index].chart.zoomArgument(time0, time1);
    }
    var trainDom = trains[index].dom;
    trainDom.className = "";
    trains[index].chart.render();
    var s1 = "Поезд #" + tr.route0 + " => " + tr.route1 + " №#" + tr.number + "(№#" + tr.number2 + "). В Пути: " + tr.timeInWay;
    var s2 = "Отправление " + tr.date0 + " " + tr.time0 + ", прибытие " + tr.date1 + " " + tr.time1;
    trainDom.children[0].textContent = s1;
    trainDom.children[1].textContent = s2;
};
ProcessTopForMainPage = function () {
    var i = 0;
    for (var route of DataSource1) {
        DrawItem(route.trainInfo, i);
        i++;
    }
};
var ProcessDateStr = function (dateStr) {
    var i = 0;
    for (var route of DataSource1) {
        if (dateStr != route.date)
            continue;
        for (var trainObj of route.trains) {
            DrawItem(trainObj, i);
            i++;
        }
    }
    for (i; i < trains.length; i++) {
        var trainDom = trains[i].dom;
        trainDom.className = "skip";
    }
};

var IsMainPage = false;
$(function () {
        Globalize.culture('ru');
        if (location.pathname == "/2017ny/" || location.pathname == "/2016summer/") {
            IsMainPage = true;
            //CreateHiddenTrains(50);
            //$("#title")[0].children[0].textContent = "TOP";
        } else {
            calendar = $("#calendar-container").dxCalendar({
                value: new Date(),
                disabled: false,
                firstDayOfWeek: 0,
                zoomLevel: zoomLevels[0].text,
                // max: range.max,
                // min: range.min,
                onValueChanged: function (data) {
                    //console.log(data.value);
                    var month = data.value.getMonth() + 1;
                    if (month < 10)
                        month = "0" + month;
                    var day = data.value.getDate();
                    if (day < 10)
                        day = "0" + day;
                    var dateStr = day + "." + month + "." + data.value.getFullYear();
                    location.hash = dateStr;
                    ProcessByHashLocation();
                }
            }).dxCalendar("instance");
            if (!location.hash) {
                if (location.pathname.indexOf("2016summer") == -1)
                    location.hash = "01.01.2017";
                else
                    location.hash = "30.07.2016";
            }
            $("#title")[0].children[0].textContent = RouteName;
            CreateHiddenTrains(50);
        }
        $("#types").dxSelectBox({
            dataSource: types,
            value: types[1],
            onValueChanged: function (e) {
                for (var item in trains) {
                    if (trains[item]["chart"])
                        trains[item]["chart"].option("commonSeriesSettings.type", e.value);
                }
            }
        });
    }
);