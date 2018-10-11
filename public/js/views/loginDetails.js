var LoginDetailsView = Backbone.View.extend({
    breadcrumb: {},

    events: {
        'click .save-button' : 'validateForm',
        'click .agreement-button': 'openAgreement',
        'click #agreeCheckbox': 'enableSubmit'
    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.breadcrumb = options.breadcrumb;
        this.model = options.model;
    },

    render: function () { 
        var that = this;
        this.$el.html(this.template({
            loginDetails: this.model.toJSON(),
        }));

        this.slideOut = $('.sidenav').show();
        this.navWrapper = $('.nav-wrapper').show();
        this.white = $('.white').show();

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
            document.getElementById('password').focus();
        });

        return this;
    },

    validateForm: function () {
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
                if (data.status == "BadSerial")
                {
                    M.toast({ html: '{Literal}Serial Code is invalid{/Literal}' });
                }
                else{
                    App.serialNumber = serialNumber;
                    that.logIn();
                }
            });
        }
        else if (serialNumber == '') {
            M.toast({ html: '{Literal}Please enter a valid serial number{/Literal}' });
        }
    },

    logIn: function () {
        var that = this;
        var password = this.$el.find('#password').val();
        var confirmPassword = this.$el.find('#confirmPassword').val();
        password = password.trim();
        confirmPassword = confirmPassword.trim();
        var serialNumber = App.serialNumber;

        var rkEncryptionKey = CryptoJS.enc.Base64.parse('u/Gu5posvwDsXUnV5Zaq4g==');
        var rkEncryptionIv = CryptoJS.enc.Base64.parse('5D9r9ZVzEYYgha93/aUK2w==');
        var utf8Stringified = CryptoJS.enc.Utf8.parse(password);
        var encrypted = CryptoJS.AES.encrypt(password, rkEncryptionKey, {mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7, iv: rkEncryptionIv});
        var ciphertext = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
        if (password != '' && confirmPassword != '') {
            if (password == confirmPassword) {
                M.toast({ html: '{Literal}Creating Database{/Literal}. {Literal}Please Wait{/Literal}...' });
                $.post("/data/first-login",
					{
						serialNumber: App.serialNumber,
						languageCode: 'EN',
						newPassword: ciphertext,
						confirmPassword: ciphertext,
                    })
                    .done(function(data)
					{
						if (data.status == "Success")
						{
                            document.cookie = "sessionCookie=" + data.token
                            window.location.href = "#/company-info";
                        }

						else 
						{
                            M.toast({ html: '{Literal}Error creating customer database{/Literal}' });
						}
					});
            }
            else {
                M.toast({ html: '{Literal}The passwords do not match{/Literal}' });
            }
        }
        else {
            M.toast({ html: '{Literal}Please enter a valid password{/Literal}' });
        }
    },

    openAgreement: function () {
        var full = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
        window.open(full + "/license_files/license.html");
        $("#agreeCheckbox").removeAttr('disabled');
    },

    enableSubmit: function () {
        var agreeCheckbox =  this.$el.find('#agreeCheckbox:checked').length > 0;
        if (agreeCheckbox) {
            $("#submitButton").removeAttr('disabled');
            $("#agreeCheckbox").attr("disabled", true);
        }
        else {
            $("#submitButton").attr()('disabled');
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
