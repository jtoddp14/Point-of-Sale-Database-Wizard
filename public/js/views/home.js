var HomeView = Backbone.View.extend({
    breadcrumb: {},
    chartRendered: false,
    openOrders: 0,
    chartDataColors: [
        '#d1d1d1',
        '#a156c4',
        '#ebc143',
        '#8097a2',
        '#39c7c1'
    ],
    dataColorIndex: 0,
    labeledDataColors: {},

    events: {
        'click .quicklink-card-title': 'toggleCard',
        'click .ap-collection-item': 'toggleTillSelection',
        'click .generate-button': 'handleGenerateAction'
    
    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.breadcrumb = options.breadcrumb;

        this.getCustomers();
        this.getTillsAndRender(this.renderTills);
    },

    render: function () {
        App.setBreadcrumbs(this.breadcrumb);
        
        this.getSalesData();
        $(document).ready(function () {
            $('.quicklink-card-content').mCustomScrollbar({
                setHeight: 150,
                axis: 'y',
                scrollInertia: 1000,
                autoHideScrollbar: true
            });
        });

        return this;
    },

    toggleCard: function (e) {
        var element = $(e.currentTarget);
        $("html, body").animate({ scrollTop: $(document).height() }, "fast");
        
        var siblings = $(element).siblings();
        
        $('.quicklink-card-content, .quicklink-card-footer').not(siblings).hide();
        $(siblings).toggle();
    },

    toggleTillSelection: function (e) {
        var element = $(e.currentTarget);
        var tillHasOpenOrders = $(element).hasClass('ap-collection-item-disabled');
        if (tillHasOpenOrders === false) {
            var previouslySelected = $(element).hasClass('ap-light-blue');
            if ($(element).parent().hasClass('master-z-till-list') === false) {
                $(element).siblings().each(function() {
                    $(this).removeClass('ap-light-blue');
                    $(this).find('.ready, .open-orders, till-users').removeClass('white-text');
                    $(this).attr('data-selected', 'false');
                });
            }
            $(element).toggleClass('ap-light-blue');
            $(element).find('.ready, .open-orders, till-users').toggleClass('white-text');
            
            $(element).attr('data-selected', !previouslySelected ? 'true' : 'false');
            this.toggleButton(element);
        } else {
            M.toast({
                html: '{Literal}You cannot Z-out tills with open orders{/Literal}'
            });
        }
    },

    getCookie: function() {
        var nameEQ = "sessionCookie" + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
    },

    getTillsAndRender: function (callback) {
        var sessionToken = this.getCookie();
        var that = this;
        $.ajax({
            url: '/data/get-tills',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                callback(data.results, that);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({
                        html: '{Literal}There was a problem fetching tills from the server{/Literal}'
                    });
                }
            }
        });
    },

    renderTills: function (tills, that) {
        var noTillsWarning = true;
        for (var i = 0; i < tills.length; i++) {
            if (typeof tills[i].hasOrders !== 'undefined' && tills[i].hasOrders === true) {
                noTillsWarning = false;
                break;
            }
        }
        that.$el.html(that.template({
            tills: tills,
            noTillsWarning: noTillsWarning
        }));

        var insertOpenOrders = document.getElementById('openOrderCount');
        insertOpenOrders.value = that.openOrders;
    },

    toggleButton: function (el) {
        var dataType = $(el).parent().attr('data-type');
        var elementSelected = $(el).attr('data-selected') === 'true';
        var oneOfSiblingsSelected = false;
        $(el).siblings().each(function() {
            oneOfSiblingsSelected = $(this).attr('data-selected') === 'true';
        });

        if (elementSelected || oneOfSiblingsSelected) {
            this.$el.find('.generate-button[data-type="' + dataType + '"]').removeClass('disabled');    
        } else {
            this.$el.find('.generate-button[data-type="' + dataType + '"]').addClass('disabled');    
        }        
    },

    openReportWindowWithPostRequest: function (winURL, params) {
        var winName='AccoPOS Report';
        var windowoption='resizable=yes,height=768,width=1024,location=0,menubar=0,scrollbars=1';
        var form = document.createElement("form");
        form.setAttribute("method", "post");
        form.setAttribute("action", winURL);
        form.setAttribute("target", winName);  
        for (var i in params) {
            if (params.hasOwnProperty(i)) {
                var input = document.createElement('input');
                input.type = 'hidden';
                input.name = i;
                input.value = params[i];
                form.appendChild(input);
            }
        }
        document.body.appendChild(form);
        window.open('', 'winName', windowoption);
        form.target = winName;
        form.submit();
        document.body.removeChild(form);           
    },

    handleGenerateAction: function (e) {
        var element = $(e.currentTarget);
        var type = $(element).attr('data-type');
        var that = this;
        var selectedTillsElements = this.$el.find('.ap-collection[data-type="' + type + '"]').find('.ap-collection-item[data-selected="true"]');
        var selectedTills = [];
        if (selectedTillsElements.length < 1) {
            return;
        }
        for (var i = 0; i < selectedTillsElements.length; i++) {
            selectedTills.push($(selectedTillsElements[i]).attr('data-id'));
        }
        
        switch (type) {
            case 'x-out':
                var params = {
                    selectedTill: selectedTills[0],
                    showGraphs: true
                };
                this.openReportWindowWithPostRequest('/get-x-out-report', params);
                break;
            case 'z-out':
                var tillTotal = this.$el.find('#z-out-total-cash').val();
                try {
                    tillTotal = parseFloat(tillTotal);
                } catch (e) {
                    tillTotal = 0.0;
                }
                
                var params = {
                    selectedTill: selectedTills[0],
                    showGraphs: $('#z-out-show-graphs').is(':checked'),
                    tillTotal: tillTotal
                };
                this.openReportWindowWithPostRequest('/get-z-out-report', params);
                break;
            case 'master-z':
                var params = {
                    selectedTills: selectedTills.join(','),
                    showGraphs: true
                };
                this.openReportWindowWithPostRequest('/get-master-z-report', params);
                break;
            default:
                break;
            
        }
    },

    renderCharts: function (currency, data) {
        var shouldRenderCharts = typeof data.totalSales !== 'undefined' && data.totalSales > 0;
        
        if (!shouldRenderCharts) {
            this.$el.find('.no-data-message').show();
        } else {
            this.$el.find('.no-data-message').hide();
        }
        var salesByTime = data.salesByTimeData;
        var salesByTenderTypeObj = data.salesByTenderType;
        var salesByItemTypeObj = data.salesByItemType;
        
        var salesByTimeColumns = (['Sales']).concat(salesByTime.salesData);
        var salesByTimeLabels = salesByTime.salesLabels;

        var salesByItemTypeColumns = ['Sales'];
        var salesByItemTypeLabels = [];
        for (var itemType in salesByItemTypeObj) {
            salesByItemTypeColumns.push(salesByItemTypeObj[itemType]);
            salesByItemTypeLabels.push(itemType);
        }


        var salesByTenderType = [];
        for (var tenderType in salesByTenderTypeObj) {
            salesByTenderType.push([tenderType, Math.abs(parseInt(salesByTenderTypeObj[tenderType]))]);
        }
        
        if (!this.chartRendered) {
            var that = this;
            var chart1 = c3.generate({
                bindto: '#sales-line-chart',
                size: {
                    height: 150
                },
                legend: {
                    show: false
                },
                grid: {
                    y: {
                        show: true
                    }
                },
                data: {
                    color: function (color, d) {
                        if (typeof that.labeledDataColors[d.id] === 'undefined') {
                            that.labeledDataColors[d.id] = that.chartDataColors[that.dataColorIndex];
                            that.dataColorIndex = that.dataColorIndex === (that.chartDataColors.length - 1) ? 0 : that.dataColorIndex++;
                        }
                        return that.labeledDataColors[d.id];
                    },
                    type: 'area-spline',
                    columns: [ salesByTimeColumns ]
                },
                axis: {
                    x: {
                        tick: {
                            rotate: 45,
                            multiline: false
                        },
                        type: 'category',
                        categories: salesByTimeLabels
                    },
                    y: {
                        tick: {
                            count: 5,
                            format: d3.format("d")
                        }
                    }
                }
            });

            if (shouldRenderCharts) {
                var tenderTypesChart = c3.generate({
                    bindto: '#sales-donut-chart',
                    legend: {
                        position: 'right'
                    },
                    size: {
                        height: 150
                    },
                    data: {
                        colors: {
                            Credit: '#e20000',
                            Cash: '#ecb613',
                            Check: '#a156c4',
                            Other: '#8830b1',
                            'Pay on Acco...': '#565656'
                        },
                        columns: salesByTenderType,
                        type: 'pie'
                    },
                    donut: {
                        title: "Tender"
                    }
                });

                this.dataColorIndex = 0;
                this.labeledDataColors = {};

                var chart3 = c3.generate({
                    bindto: '#sales-bar-chart',
                    size: {
                        height: 150
                    },
                    grid: {
                        y: {
                            show: true
                        }
                    },
                    data: {
                        color: function (color, d) { return '#11b5ae' },
                        columns: [salesByItemTypeColumns],
                        type: 'bar'
                    },
                    legend: {
                        show: false
                    },
                    tooltip: {
                        format: {
                            title: function (d) { return 'Data ' + d; },
                            value: function (value, ratio, id) {
                                var format = id === 'data1' ? d3.format(',') : d3.format('$');
                                return format(value);
                            }
                //            value: d3.format(',') // apply this format to both y and y2
                        }
                    },
                    axis: {
                        x: {
                            tick: {
                                multiline: true
                            },
                            type: 'category',
                            categories: salesByItemTypeLabels
                        },
                        y: {
                            tick: {
                                format: d3.format("d"),
                                count: 5
                            }
                        }
                    },
                    bar: {
                        width: {
                            ratio: 0.75
                        }
                    }
                });
            }
        }
        
    },

    getSalesData: function () {
        var that = this;
        var sessionToken = this.getCookie();

        this.$el.find('#loading').hide();
    },
    
    getCustomers: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-pos-users',
            data: {
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                for (var i=0; i < data.results.length; i++) {
                    if (data.results[i].openOrderCount != 'undefined' && data.results[i].openOrderCount > 0) {
                        that.openOrders += (data.results[i].openOrderCount)
                    }
                }
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem getting customers{/Literal}.' });
                }
            }
        });
    },
});