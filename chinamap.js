(function(Raphael) {
    angular.module('ChinaMap', []).provider('Map', function() {
        function Map() {
            /*
             * 配置Raphael生成svg的属性
             */
            $("#map").html("");
            Raphael.getColor.reset();
            var R = Raphael("map", 650, 500); //大小与矢量图形文件图形对应；

            var current = null;

            var textAttr = {
                "fill": "#000",
                "font-size": "12px",
                "cursor": "pointer"
            };

            //调用绘制地图方法
            paintMap(R);

            var ToolTip = $('#ToolTip');
            //ToolTip.html('地图成功绘制！请选择省市').delay(1500).fadeOut('slow');
            $('body').append("<div id='tiplayer' style='display:none'></div>");
            var tiplayer = $('#tiplayer');
            for (var state in china) {
                //分省区域着色
                china[state]['path'].color = Raphael.getColor(0.9);
                //china[state]['path'].animate({fill: china[state]['path'].color, stroke: "#eee" }, 500);
                china[state]['path'].transform("t30,0");

                (function(st, state) {
                    //***获取当前图形的中心坐标
                    var xx = st.getBBox().x + (st.getBBox().width / 2);
                    var yy = st.getBBox().y + (st.getBBox().height / 2);

                    //***修改部分地图文字偏移坐标
                    switch (china[state]['name']) {
                        case "江苏":
                            xx += 5;
                            yy -= 10;
                            break;
                        case "河北":
                            xx -= 10;
                            yy += 20;
                            break;
                        case "天津":
                            xx += 20;
                            yy += 10;
                            break;
                        case "上海":
                            xx += 20;
                            break;
                        case "广东":
                            yy -= 10;
                            break;
                        case "澳门":
                            yy += 10;
                            break;
                        case "香港":
                            xx += 20;
                            yy += 5;
                            break;
                        case "甘肃":
                            xx -= 40;
                            yy -= 30;
                            break;
                        case "陕西":
                            xx += 5;
                            yy += 20;
                            break;
                        case "内蒙古":
                            xx -= 15;
                            yy += 65;
                            break;
                        default:
                    }


                    //***写入地名,并加点击事件,部分区域太小，增加对文字的点击事件
                    china[state]['text'] = R.text(xx, yy, china[state]['name']).attr(textAttr).click(function() {
                        clickMap();
                    }).hover(function() {
                        var $sl = $("#topList").find("[title='" + china[state]['name'] + "']:not([select])");
                        $sl.css("font-size", "20px");
                    }, function() {
                        var $sl = $("#topList").find("[title='" + china[state]['name'] + "']:not([select])");
                        $sl.css("font-size", "");
                    });

                    //图形的点击事件
                    $(st[0]).click(function(e) {
                        clickMap();
                    });
                    //鼠标样式
                    $(st[0]).css('cursor', 'pointer');
                    //移入事件,显示信息
                    $(st[0]).hover(function(e) {
                        var _ST = this;

                        var $sl = $("#topList").find("[title='" + china[state]['name'] + "']:not([select])");
                        if (e.type == 'mouseenter') {
                            tiplayer.text(china[state]['name']).css({
                                'opacity': '0.75',
                                'top': (e.pageY + 10) + 'px',
                                'left': (e.pageX + 10) + 'px'
                            }).fadeIn('normal');
                            $sl.css("font-size", "20px");
                        } else {
                            if (tiplayer.is(':animated')) tiplayer.stop();
                            tiplayer.hide();

                            $sl.css("font-size", "");
                        }

                    });

                    function clickMap() {
                        if (current == state)
                            return;
                        //重置上次点击的图形
                        current && china[current]['path'].animate({
                            transform: "t30,0",
                            fill: china[current]['isClick'] ? china[current]['path'].color : "#b0d0ec",
                            stroke: "#ddd"
                        }, 2000, "elastic");

                        current = state; //将当前值赋给变量
                        //对本次点击
                        china[state]['path'].animate({
                            transform: "t30,0 s1.03 1.03",
                            fill: china[state]['path'].color,
                            stroke: "#000"
                        }, 1200, "elastic");
                        st.toFront(); //向上
                        R.safari();

                        china[current]['text'].toFront(); //***向上

                        if (china[current] === undefined) return;

                        $("#topList").find("[title='" + china[current]['name'] + "']").click();
                    }
                })

                (china[state]['path'], state);
            }
        }


        //***绑定数据
        function Bind() {

            var args = $("#args *").serialize();

            $.ajax({
                type: "get",
                url: "http://www.5imvc.com/Scripts/jsonp/mapList.js", //jsonp
                dataType: "jsonp",
                jsonp: "callback",
                jsonpCallback: "get",
                success: function(data) {

                    var html = "";
                    $.each(data, function(i, item) {
                        html += "<div style='cursor:pointer;font-weight:bolder;color:" + china[item.AreaName]['path'].color + "' title='" + china[item.AreaName]['name'] + "'>TOP " + (i + 1) + ":" + china[item.AreaName]['name'] + "</div>"

                        var anim = Raphael.animation({
                            fill: china[item.AreaName]['path'].color,
                            stroke: "#eee"
                        }, 1000);
                        //*** anim.delay(i * 500)增加显示延时，就是让排序省份一个一个显示，但是在IE9以下没效果，因为IE会假死，知道全部显示完
                        china[item.AreaName]['path'].stop().animate(anim.delay(i * 500));
                        china[item.AreaName]['isClick'] = true;
                    });

                    //将省区排行增加到页面，并增加点击事件查询城市排行
                    $("#topList").html(html).find("div").click(function() {

                        var title = $(this).attr("title");
                        $(this).siblings().css("font-size", "").removeAttr("select").end().css("font-size", "20px").attr("select", "");

                        ////显示省份明细，自己修改
                        //$.post(url + "/" + encodeURI(title), args, function (data) {
                        //    $('#areaInfo').html(title + "的销量：<br/>" + data).fadeIn('fast');
                        //});
                    });

                },
                error: function() {
                    alert('错误');
                }
            });
        }

        this.$get = function() {
            var service = {
                showMap : function(txt) {
                    Map();
                    Bind();
                    console.log(txt);
                }
            };

            return service;
        }

    })
})(Raphael);