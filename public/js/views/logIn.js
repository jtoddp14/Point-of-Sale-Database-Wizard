var LogInView = Backbone.View.extend({
    breadcrumb: {},

    events: {
        'click .save-button' : 'logIn',
        'click .forgot-button': 'forgotPassword',
        'click .cancel-modal-button': 'closeForgotPassword'
    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.breadcrumb = options.breadcrumb;
        this.model = options.model;
    },

    render: function () { 
        var that = this;
        document.cookie = "sessionCookie" + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        this.slideOut = $('.sidenav').hide();
        this.navWrapper = $('.nav-wrapper').hide();
        this.white = $('.white').hide();

        this.$el.html(this.template({
            logIn: this.model.toJSON(),
        }));
        App.setBreadcrumbs(this.breadcrumb);
        $(document).on('keydown', 'input, select', function(e) {
            var self = $(this)
              , form = self.parents('form:eq(0)')
              , focusable
              , next
              ;
            if (e.keyCode == 13) {
                that.$el.find(".save-button").trigger("click");
                return false;
            }
        });

        $(document).ready(function () {
            document.getElementById('serialNumber').focus();
        });

        return this;
    },

    forgotPassword: function () {
        $('#forgot-password-modal').show();  
    },

    closeForgotPassword: function () {
        $('#forgot-password-modal').hide(); 
    },

    logIn: function () {
        var that = this;
        var serialNumber = this.$el.find('#serialNumber').val();
        serialNumber = serialNumber.trim();
        var password = 'Testing'	
        var rkEncryptionKey = CryptoJS.enc.Base64.parse('u/Gu5posvwDsXUnV5Zaq4g==');
        var rkEncryptionIv = CryptoJS.enc.Base64.parse('5D9r9ZVzEYYgha93/aUK2w==');
        var utf8Stringified = CryptoJS.enc.Utf8.parse(password);
        var encrypted = CryptoJS.AES.encrypt(password, rkEncryptionKey, {mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7, iv: rkEncryptionIv});
        var ciphertext = encrypted.ciphertext.toString(CryptoJS.enc.Base64);

        if (serialNumber != '') {
            var logIn = $.post("/data/validate-serial",
            {
                password: ciphertext,
                serialNumber: serialNumber,
            })
            logIn.done(function(data) {
                if (data.status == "GetPassword") {
                    App.serialNumber = serialNumber;
                    that.submitPasssword();
                }
                else if (data.status == "FirstLogin")
                {
                    window.location.href = "#/log-in-details";
                    App.serialNumber = serialNumber;
                }
                else if (data.status == "BadSerial")
                {
                    M.toast({ html: '{Literal}Serial Code is invalid{/Literal}' });
                }
                else
                {
                    M.toast({ html: '{Literal}An error has occured{/Literal}' });
                }
            });
        }
        else if (serialNumber == '') {
            M.toast({ html: '{Literal}Please enter a valid serial number{/Literal}' });
        }
    },

    submitPasssword: function () {
        var that = this;
        var serialNumber = this.$el.find('#serialNumber').val();
        serialNumber = serialNumber.trim();
        var password = this.$el.find('#password').val();
        password = password.trim();
        var rkEncryptionKey = CryptoJS.enc.Base64.parse('u/Gu5posvwDsXUnV5Zaq4g==');
        var rkEncryptionIv = CryptoJS.enc.Base64.parse('5D9r9ZVzEYYgha93/aUK2w==');
        var utf8Stringified = CryptoJS.enc.Utf8.parse(password);
        var encrypted = CryptoJS.AES.encrypt(password, rkEncryptionKey, {mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7, iv: rkEncryptionIv});
        var ciphertext = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
        if (password != '') {
            App.password = password;
            var encrypt = $.post("/data/login",
            {
                serialNumber: serialNumber,
                userPassword: ciphertext,
            }) 
            encrypt.done(function(data){
                if (data.status == "Success") {
                    document.cookie = "sessionCookie=" + data.token;
                    App.password = password;
                    App.serialNumber = serialNumber;

                    App.newBuild = false;
                    App.newUser = false;
                    App.newCompany = false;
                    App.newRetail = false;
                    App.newReceipt = false;

                    window.location.href = "#/company-info";
                    that.navWrapper.show();
                    that.white.show();  
                    that.slideOut.show();
                }
                else if (data.status == "BadPassword") {
                    M.toast({ html: '{Literal}Invalid Password{/Literal}' });
                }
            });
        }
        else {
            M.toast({ html: '{Literal}Please enter a valid password{/Literal}' });
        }
    },

    setToken: function () {
        window.location.href = "#/company-info";
        this.navWrapper.show();
        this.white.show();  
        this.slideOut.show();
    },
    
    setCookie: function (name, value) {
        document.cookie = name + "=" + (value || "");
    }
});
