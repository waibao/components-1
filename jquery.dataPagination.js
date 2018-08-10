/**
 * 北京大学新结构经济学研究院列表、内文分页组件，DataPagination plug-in.
 * by luoming@dwnews.com
 * license: MIT
 * http://www.dwnews.com
 */
(function($ , undefined) {

    var Pagination = function (element, options) {
        this.$this = $(element);
        this.options = $.extend({}, $.fn.pagination.defaults, options || {});
        this.init();
    };
    // 使用proptotype给Pagination添加属性
    Pagination.prototype = {
        constructor: Pagination,
        dataToObj: function(str){
            if(typeof str == "string" && str[0] == "&"){
                str = str.substring(1, str.length);
            }
            if(typeof str == "string"){
                str = str.replace(/&/g,"','");
                str = str.replace(/=/g,"':'");
                str = "({'"+str +"'})";
                return eval(str);
            }
        },

        init: function () {
            var options = this.options;
            //if(!options.columns) return false;
            this.$this.html("");
            this.initPagination(options.currentPage);
        },

        initPagination: function(currentPage){
            console.log("this.options.data",this.options.data);
            var that = this, options = this.options, data = null;
            if(options.data!=""){
                data = this.dataToObj(options.data);
            }
            data["currentPage"] = currentPage;
            console.log("options.data",data);
            console.log("currentPage",currentPage);
            $.ajax({
                type: "POST",
                dataType: "json",
                url: options.url,
                data: data,
                beforeSend: function(){
                    console.log("请求中,请等待！！！");
                },
                timeout: options.timeout,
                complete: function(XMLHttpRequest, textStatus){
                    if(textStatus == "timeout"){ console.log("请求超时,请重试！！！"); }
                    console.log("请求完成！！！");
                },
                success : function(result){
                    pageNo = data ? data.pageNo : 0;
                    that.loadPaginationBar(result, parseInt(currentPage || pageNo));
                }
            });
        },

        initPaginationBody: function(result){
            if(typeof(options.callback) == 'function'){
                options.callback(result);
            }
        },

        //给开始索引与结束索引赋值
        excutePagerIndex:function(){
            this.options.endIndex =1;
            this.options.startIndex =1;
            if (this.options.totalPages > this.options.pagerSize && this.options.currentPage <= this.options.pagerSize)
            {
                this.options.startIndex = 1;
                this.options.endIndex = this.options.pagerSize;
            }
            else if (this.options.totalPages > this.options.pagerSize && this.options.currentPage > this.options.pagerSize)
            {
                if (this.options.pagerSize != 1 && this.options.currentPage % this.options.pagerSize != 0)
                {
                    this.options.startIndex = parseInt(this.options.currentPage / this.options.pagerSize) * this.options.pagerSize + 1;
                    this.options.endIndex = this.options.startIndex + this.options.pagerSize - 1 > this.options.totalPages ? this.options.totalPages : this.options.startIndex + this.options.pagerSize - 1;
                }
                else if (this.options.currentPage % this.options.pagerSize == 0)
                {
                    this.options.endIndex = this.options.currentPage;
                    this.options.startIndex = this.options.currentPage - this.options.pagerSize + 1;
                }
                else
                {
                    this.options.startIndex = this.options.currentPage;
                    this.options.endIndex = this.options.startIndex + this.options.pagerSize - 1 > this.options.totalPages ? this.options.totalPages : startIndex + this.options.pagerSize - 1;
                }
            }
            else
            {
                this.options.startIndex = 1;
                this.options.endIndex = this.options.totalPages;
            }
        },

        loadPaginationBar: function(result, currentPage){
            currentPage = currentPage || 1;
            var that = this,
                total = result.total || 0;
                options = this.options,
                totalPages = Math.ceil(total/options.pageSize),
                pageWrap = $('#'+options.pagingBarId);
            pageWrap.html('');

            that.initPaginationBody(result);

            that.options.currentPage = currentPage;
            that.options.totalPages = totalPages;
            var ph = [];
            if(that.options.totalPages>1){
                that.excutePagerIndex();
                ph.push("<div class=\"pagenum page-list\">");
                ph.push("<a href='javascript:void(0);' page-data='prevPage' class='pre'>< 上一页</a>&nbsp;&nbsp;");
                ph.push("<a href='javascript:void(0);' page-data='first' class='firstPage'>首页</a>&nbsp;&nbsp;");
                if (that.options.startIndex > that.options.pagerSize)
                {
                    ph.push("<a href='javascript:void(0);' page-data='prev'>...</a>&nbsp;&nbsp;");
                }
                for (var i = that.options.startIndex; i <= that.options.endIndex; i++)
                {
                    if (i != that.options.currentPage)
                    {
                        ph.push("<a href='javascript:void(0);'>"+i+"</a>&nbsp;&nbsp;");
                    }
                    else
                    {
                        ph.push("<span class=\"pageSelected\">"+i+"</span>&nbsp;&nbsp;");
                    }
                }
                if (that.options.endIndex >= that.options.pagerSize && that.options.endIndex < that.options.totalPages)
                {
                    ph.push("<a href='javascript:void(0);' page-data='after'>...</a>&nbsp;&nbsp;");
                }
                ph.push("<a href='javascript:void(0);' page-data='end' class='lastPage'>尾页</a>&nbsp;&nbsp;");
                ph.push("<a href='javascript:void(0);' page-data='afterPage' class='next'>下一页 ></a>");
                ph.push("</div>");
            }
            pageWrap.append(ph.join(""));
            var _this = this;
            $("div.pagenum").find("a").each(function(i){
                $(this).click( function () {
                    var ti=$(this).text();
                    switch($(this).attr("page-data")){
                        case "prev":
                        ti=that.options.startIndex - 1;
                        break;
                        case "after":
                        ti=that.options.endIndex + 1;
                        break;
                        case "first":
                        ti=1;
                        break;
                        case "end":
                        ti=that.options.totalPages;
                        break;
                        case "prevPage":
                        ti = _this.options.currentPage -1;
                        console.log("$.fn.pagination.currentPage-1",ti);
                        break;
                        case "afterPage":
                        ti = _this.options.currentPage +1;
                        console.log("$.fn.pagination.currentPage+1",ti);
                        break;
                    }
                    that.pageTurning(ti,that.options.channelType);
                });
            });
        },

        pageTurning: function(currentPage,channelType){
            console.log("channelType",channelType);
            this.initPagination(currentPage);
        }
    };

    // option 可以是对象或者是方法名
    // value option为方法名时的参数
    $.fn.pagination = function (option, value) {
        var methodReturn;

        var $set = this.each(function () {
            var $this = $(this),
                options = typeof option === 'object' && option,
                data = new Pagination(this, options);
            if (typeof option === 'string') {
                methodReturn = data[option](value);
            };
        });

        return methodReturn ? $set : methodReturn;
    };

    $.fn.pagination.defaults = {
        url : "",
        data:"",
        pageSize:10,
        startIndex:1,
        endIndex:5,
        pagerSize:5,//每页显示5个页码
        totalPages:30,//总页数
        channelType:"news",//分频道类型
        timeout: 10000,
        currentPage: 1,
        pagingBarId: "paginationholder",
        callback: null
    };
    // 将插件类暴露给外界:
    $.fn.pagination.Constructor = Pagination;

})(jQuery);