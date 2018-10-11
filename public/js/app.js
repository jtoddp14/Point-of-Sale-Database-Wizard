var AppRouter = Backbone.Router.extend({
    literals: [],
    isRightToLeft: false,
    rtl: false,
    israCardBuild: false,
    password: '',
    serialNumber: '',
    newBuild: true,
    newCompany: true,
    newRetail: true,
    newUsers: true,
    newReceipt: true,

    serverInfo: {
        isFoodService: false,
        hasAccuShift: false,
        isRightToLeft: false,
        hasVatTax: false,
        hasIntegratedRemoteDisplay: false,
        hasSageLiveIntegration: false,
        hasQBOIntegration: false,
        hasAccounting: false,
        hasRemoteDisplay: false,
        israCardBuild: false,
    },

    routes: {
        "": "logIn",
        "home": "home",
        "pos-users": "posUsers",
        "company-info": "companyInfo",
        "receipt-settings": "receiptSettings",
        "session-expired": "sessionExpired",
        "log-in": "logIn",
        "log-in-details": "loginDetails",
        "retail": "retail",
        "product-lines": "productLines",
        "items": "items",
        "completed": "completed",
        // this route MUST be the last one:
        "*invalidRoute": "pageNotFound"
    },

    showToast: function (message) {
        M.Toast.dismissAll();
        M.toast({
            html: message
        });
    },

    isMobileDevice: function() {
        try {
            var deviceWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
            return deviceWidth < 600;
        } catch (e) {
            return false;
        }
    },

    setBreadcrumbs: function (breadcrumbs) {
        var breadcrumbsHtml = "";
        for (var i = 0; i < breadcrumbs.length; i ++) {
            if (!this.isMobileDevice() || (i === breadcrumbs.length - 1)) {
                breadcrumbsHtml += '<a href="' + breadcrumbs[i].path + '" class="breadcrumb blue-text darken-2">' + breadcrumbs[i].label + '</a>';
            }
        }
        $("#breadcrumbs").html(breadcrumbsHtml);
    },

    initGlobalAjaxHandlers: function () {
        var that = this;
        $(document).ajaxComplete(function(request, response, meta) {
            var payload = {};
            if (typeof response !== 'undefined') {
                if (typeof response.responseJSON !== 'undefined') {
                    payload = response.responseJSON;
                } else if (typeof response.responseText !== 'undefined') {
                    try {
                        payload = JSON.parse(response.responseText);
                    } catch (e) { }
                }
            }
            if (typeof payload.error !== 'undefined' && payload.error === 'SESSION_EXPIRED') {
                that.navigate('session-expired', {trigger: true});
            }
        });
    },

    initSideNavAndScrollbars: function () {
        var elems = document.querySelectorAll('.sidenav');
        var instances = M.Sidenav.init(elems, {
            edge: 'right',
            draggable: true
        });
        $('.collapsible').collapsible();
        $("main").mCustomScrollbar({
            axis: 'y',
            scrollInertia: 1000,
            autoHideScrollbar: true
        }); 

        $("#slide-out").css('direction', 'rtl');
        $("body").css('direction', 'rtl');
        $("main").css('direction', 'rtl');
        $("#global-wrapper").css('direction', 'rtl');
        $('.dropdown-icon').each(function() { 
            $(this).removeClass('right');
            $(this).addClass('left');
        });
        $("#slide-out").css('direction', 'ltr');
        $("#slide-out").mCustomScrollbar();
        $('#logo-img').hide();
        $('#israSideNavImg').show();
        $("#logo-wrapper").removeClass('ap-blue');
        $("#logo-wrapper").addClass('color', '#f5f5f5');
        $("#collapsible-accordion").removeClass('white-text');
        $("#slide-out").removeClass('ap-medium-blue');

        document.title = 'IsraPOS Install Wizard'
        var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        document.getElementsByTagName('head')[0].appendChild(link);
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = 'img/isracard-logo.png';
        $("#rtl-supprt-css").removeAttr("disabled");
        $("#slide-out").show();
    },

    initialize: function () {
        this.initGlobalAjaxHandlers();
        var that = this;
        
        $(document).ready(function(){
            that.initSideNavAndScrollbars();
            $(window).scroll(function() {
             var y = $(window).scrollTop();
             if( y > 0 ){
                 $("#top-shadow").show();
             } else {
                 $("#top-shadow").hide();
             }
            });
        })
    },

    sessionExpired: function() {
        $('main').children().detach();
        var message = '<div class="row"><div class="col s12" style="padding-top: 20px">Your session has expired. Please click <a href="/isracard/isracardlogin.html">here</a> to go to the IsraCard login page.</div></div>';
        $('main').html(message);
        this.setBreadcrumbs([{
            path: 'javascript:void(0)',
            label: '{Literal}Your Session Has Expired{/Literal}'
        }]);
    },

    pageNotFound: function () {
        $('main').children().detach();
        $('main').html('<div class="row"><div class="col s12" style="padding-top: 20px">The page you are looking for does not exist</div></div>');
        this.setBreadcrumbs([{
            path: 'javascript:void(0)',
            label: '{Literal}Page Not Found{/Literal}'
        }]);
    },

    home: function () {
        var that = this;
        $.get("templates/home.html").done(function (template) {
            that.homeView = new HomeView({
                template: template,
                breadcrumb: [{
                    path: '#/home',
                    label: ''
                }]
            });
            $('main').children().detach();
            $('main').html(that.homeView.render().el);
        });
    },

    logIn: function () {
        var that = this;
        $.get("templates/logIn.html").done(function (template) {
            that.logInView = new LogInView({
                israCardBuild: that.israCardBuild,
                template: template,
                model: new LogIn(),
                breadcrumb: [{
                    path: '#/log-in',
                    label: ''
                }]
            });
            $('main').children().detach();
            $('main').html(that.logInView.render().el);
        });
    },

    loginDetails: function () {
        var that = this;
        $.get("templates/loginDetails.html").done(function (template) {
            that.loginDetailsView = new LoginDetailsView({
                israCardBuild: that.israCardBuild,
                template: template,
                model: new LoginDetails(),
                breadcrumb: [{
                    path: '#/log-in-details',
                    label: ''
                }]
            });
            $('main').children().detach();
            $('main').html(that.loginDetailsView.render().el);
        });
    },

    companyInfo: function () {
        var that = this;
        $.get("templates/companyInfo.html").done(function (template) {
            that.companyInfoView = new CompanyInfoView({
                template: template,
                hasAccounting: that.serverInfo.hasAccounting,
                model: new CompanyInfo(),
                breadcrumb: [{
                    path: '#/company-info',
                    label: ''
                }]
            });
            $('main').children().detach();
            $('main').html(that.companyInfoView.render().el);
            //$('select').formSelect();
        });
    },

    
    retail: function () {
        var that = this;
        $.get("templates/retail.html").done(function (template) {
            that.retailView = new RetailView({
                template: template,
                model: new Retail(),
                breadcrumb: [{
                    path: '#/retail',
                    label: ''
                }]
            });
            $('main').children().detach();
            $('main').html(that.retailView.render().el);
            $(document).ready(function () {
                $('.modal').modal();
            });
        });
    },

    posUsers: function () {
        var that = this;
        $.get("templates/posUsers.html").done(function (template) {
            $.get("templates/posUserForm.html").done(function (posUserFormTemplate) {
                that.posUsersView = new POSUsersView({
                    template: template,
                    posUserFormTemplate: posUserFormTemplate,
                    collection: new POSUserCollection(),
                    breadcrumb: [{
                        path: '#/pos-users',
                        label: ''
                    }]
                });
                $('main').children().detach();
                $('main').html(that.posUsersView.render().el);
                
                $(document).ready(function () {
                    $('.modal').modal();
                    $('select').formSelect();
                });
            })
        });
    },

    productLines: function () {
        var that = this;
        $.get("templates/productLines.html").done(function (template) {
            $.get("templates/productLinesForm.html").done(function (productLineFormTemplate) {
                that.productLinesView = new ProductLinesView({
                    template: template,
                    productLineFormTemplate: productLineFormTemplate,
                    collection: new ProductLinesCollection(),
                    breadcrumb: [{
                        path: '#/product-lines',
                        label: ''
                    }]
                });
                $('main').children().detach();
                $('main').html(that.productLinesView.render().el);
                
                $(document).ready(function () {
                    $('.modal').modal();
                    $('select').formSelect();
                });
            })
        });
    },

    items: function () {
        var that = this;
        $.get("templates/items.html").done(function (template) {
            $.get("templates/itemsForm.html").done(function (itemsFormTemplate) {
                that.itemsView = new ItemsView({
                    template: template,
                    itemsFormTemplate: itemsFormTemplate,
                    collection: new ItemsCollection(),
                    breadcrumb: [{
                        path: '#/items',
                        label: ''
                    }]
                });
                $('main').children().detach();
                $('main').html(that.itemsView.render().el);
                
                $(document).ready(function () {
                    $('.modal').modal();
                    $('select').formSelect();
                });
            })
        });
    },

    receiptSettings: function () {
        var that = this;
        $.get("templates/receiptSettings.html").done(function (template) {
            that.receiptSettingsView = new ReceiptSettingsView({
                template: template,
                model: new ReceiptSettings(),
                breadcrumb: [{
                    path: '#/receipt-settings',
                    label: ''
                }]
            });
            $('main').children().detach();
            $('main').html(that.receiptSettingsView.render().el);
            //$('select').formSelect();
        });
    },

    completed: function () {
        var that = this;
        $.get("templates/completed.html").done(function (template) {
            that.completedView = new CompletedView({
                template: template,
                model: new Completed(),
                breadcrumb: [{
                    path: '#/completed',
                    label: ''
                }]
            });
            $('main').children().detach();
            $('main').html(that.completedView.render().el);
            $(document).ready(function () {
                $('.modal').modal();
            });
        });
    }
});

App = new AppRouter();
$(function () {
    if (!Backbone.history.start()) App.trigger('404');
});