var ItemsView = Backbone.View.extend({
    fullCollection: {},
    searchableCollection: {},
    productLines: [],
    deletionModal: {},
    cards: true,
    itemsCollectionCut: {},

    events: {
        'click .card-panel-entity': 'highlightCard',
        'click .edit-items-trigger': 'editItems',
        'click #add-items-button': 'addItems',
        'click .save-button': 'saveItems',
        'click .delete-button': 'deletionModal',
        'click #delete-items-confirm': 'deleteItems',
        'click .search-items-button': 'searchItems',
        'keyup #itemCode' : 'validateId',
        'keyup #description' : 'validateDescription',
        'keyup #price' : 'validatePrice',
        'click .proceed-button': 'proceedToNextPage',
        'click .previous-button': 'openPreviousPage'
    },

    breadcrumb: {},

    itemsStyleMapping: {},

    styles: [
        'ap-blue',
    ],

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.itemsFormTemplate = options.itemsFormTemplate;
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.model = options.model;
        this.initProductLines();
    },

    render: function () {
        this.progressBars();

        this.$el.html(this.template({
            items: this.collection.toJSON(),
            productLines: this.productLines
        }));

        App.setBreadcrumbs(this.breadcrumb);

        this.deletionModal = $(".modal").modal();
        var that = this;
        $(document).ready(function(){
            $('.modal').modal();
            $('select').formSelect();
            
        });
        $('.tooltipped').tooltip();
        this.formModal = this.$el.find('#items-form-modal').modal();

        $(document).on('keydown', 'input, select', function(e) {
            var self = $(this)
              , form = self.parents('form:eq(0)')
              , focusable
              , next
              ;
            if (e.keyCode == 13) {
                focusable = form.find('input,a,select,button,select').filter(':visible');
                next = focusable.eq(focusable.index(this)+1);
                if (next.length) {
                    next.focus();
                } else {
                    form.submit();
                }
                return false;
            }
        });

        return this;
    },

    progressBars: function() {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-navigation-data',
            data: {
                serialNumber: App.serialNumber,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.setNavigationClasses(data);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                   
                }
            }
        });
    },
    
    setNavigationClasses: function (navBarInfo) {
        $('#password-blue').hide();
        $('#password-green').show();
        $('#navBarPassword').css('color','#00a651')

        $('#items-gray').hide();
        $('#items-blue').show();
        $('#items-green').hide();
        $('#navBarProducts').css('color','#3970b7')

        
        if (navBarInfo.navigationData.companyDataCompleted == true) {
            $('#info-gray').hide();
            $('#info-blue').hide();
            $('#info-green').show();
            $('#navBarInfo').css('color','#00a651')
        }
        else {
            $('#info-gray').show();
            $('#info-blue').hide();
            $('#info-green').hide();
            $('#navBarInfo').css('color','gray')
        }

        if (navBarInfo.navigationData.retailCompleted == true) {
            $('#retail-gray').hide();
            $('#retail-blue').hide();
            $('#retail-green').show();
            $('#navBarRetail').css('color','#00a651')
        }
        else {
            $('#retail-gray').show();
            $('#retail-blue').hide();
            $('#retail-green').hide();
            $('#navBarRetail').css('color','gray')
        }
        
        if (navBarInfo.navigationData.receiptsCompleted == true) {
            $('#receipts-gray').hide();
            $('#receipts-blue').hide();
            $('#receipts-green').show();
            $('#navBarReceipts').css('color','#00a651')
        }
        else {
            $('#receipts-gray').show();
            $('#receipts-blue').hide();
            $('#receipts-green').hide();
            $('#navBarReceipts').css('color','gray')
        }

        if (navBarInfo.navigationData.usersCompleted == true) {
            
            $('#users-gray').hide();
            $('#users-blue').hide();
            $('#users-green').show();
            $('#navBarUsers').css('color','#00a651')
        }
        else {
            $('#users-gray').show();
            $('#users-blue').hide();
            $('#users-green').hide();
            $('#navBarUsers').css('color','gray')
        }
    },
    
    
    /*--------------------------------------Search Card Options---------------------------------------------- */

    searchItems: function () {
        var searchText = this.$el.find('#searchText').val();
        var searchField = this.$el.find('#searchField').val();
        for (var i=0; i < this.fullCollection.length; i++) {
            for (var t = 0; t < this.fullCollection.models[i].attributes.id.length; t++) {
                if (searchText.indexOf(this.fullCollection.models[i].attributes.id.charAt(t)) != -1) {
                }
            }
        }

        if (searchText == '') {
            this.collection.reset(this.fullCollection.models);
            this.getItemsFull();
        }

        else if (searchField == 0) {
            var filtered = this.fullCollection.byItemId(searchText);
            if (filtered.models.length > 0) {
                this.collection.reset(filtered.models);
                $("#searchField option[value=" + searchField + "]").attr('selected', '');
                $("select").formSelect();
            }
            else {
                M.toast({ html: '{Literal}No search results found{/Literal}' });
            }
        }
        else if (searchField == 1) {
            var filtered = this.fullCollection.byItemDescription(searchText);
            if (filtered.models.length > 0) {
                this.collection.reset(filtered.models);
                $("#searchField option[value=" + searchField + "]").attr('selected', '');
                $("select").formSelect();
            }
            else {
                M.toast({ html: '{Literal}No search results found{/Literal}' }); 
            }
        }
        else if (searchField == 2) {
            var filtered = this.fullCollection.byProductLine(searchText);
            if (filtered.models.length > 0) {
                this.collection.reset(filtered.models);
                $("#searchField option[value=" + searchField + "]").attr('selected', '');
                $("select").formSelect();
            }
            else {
                M.toast({ html: '{Literal}No search results found{/Literal}' }); 
            }
        }

        else if (searchField == 3) {
            var filtered = this.fullCollection.byPrice(searchText);
            if (filtered.models.length > 0) {
                this.collection.reset(filtered.models);
                $("#searchField option[value=" + searchField + "]").attr('selected', '');
                $("select").formSelect();
            }
            else {
                M.toast({ html: '{Literal}No search results found{/Literal}' }); 
            }
        }
    },
    
    /*-------------------------------------------Initialize/Render Options---------------------------------------------- */

    initProductLines: function() {
        this.getProductLines();
    },

    getProductLines: function () {
        var that = this;
        var sessionToken = this.getCookie();
        that.productLines = [];
        $.ajax({
            url: '/data/get-productlines',
            data: {
                serialNumber: App.serialNumber,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                for (var i=0; i < data.productLines.length; i++) {
                    that.productLines.push({"id": data.productLines[i].id, "description" : data.productLines[i].description});
                }
                that.renderProductLine(data.productLines);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem fetching item types from the server{/Literal}' });
                }
            }
        });
    },

    renderProductLine: function (data) {
        var that = this;
        for (var i = 0; i < data.length; i++) {
            var currentProductLine = data[i];
        }
        this.initItems();
    }, 

    /*--------------------------------------Form Options---------------------------------------------- */

    editItems: function (e) {
        var element = $(e.currentTarget);
        var id = $(element).attr('data-id');
        var items = this.collection.get(id);

        if (this.collection.get(id) !== null && this.collection.get(id) !== '') {
            this.itemsFormView = new ItemsFormView({
                template: this.itemsFormTemplate,
                model: items,
                productLines: this.productLines,
            });

            this.$el.find('#items-form-modal').html(this.itemsFormView.render().el);
            this.$el.find('select').formSelect();
            this.formModal.modal('open');
        }
        else {
            M.toast({ html: '{Literal}There was a problem fetching data from the server{/Literal}' });
        }
    },

    addItems: function () {
        this.isCreateMode = true;
        var items = new Items();
        this.itemsFormView = new ItemsFormView({
            template: this.itemsFormTemplate,
            model: items,
            productLines: this.productLines,
        });

        this.$el.find('#items-form-modal').html(this.itemsFormView.render().el);
        this.$el.find('select').formSelect();
        this.$el.find("select[required]").css({
            display: "block", 
            position: 'absolute',
            visibility: 'hidden'
        });  
        this.formModal.modal('open');

    },

    /*--------------------------------------Card Options---------------------------------------------- */

    generateItemsStyleMapping: function (data) {
        var items = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        for (var i = 0; i < data.length; i++) {
            if (items.indexOf(data[i].id) < 0) {
                items.push(data[i].id);
                this.itemsStyleMapping[data[i].id] = this.styles[currentStyle];
                if (currentStyle < totalStyles - 1) {
                    currentStyle++;
                } else {
                    currentStyle = 0;
                }
            }
        }
    },

    highlightCard: function (e) {
        this.$el.find('.edit').hide();
        this.$el.find('.card-panel-entity').removeClass('active');
        var element = $(e.currentTarget);
        var selected = $(element).attr('data-selected') === '1';
        
        if (selected) {
            $(element).removeAttr('data-selected');
            $(element).removeClass('active');
            $(element).find('.edit').hide();
        } else {
            $(element).removeAttr('data-selected');
            $(element).attr('data-selected', '1');
            $(element).find('.edit').show();
            $(element).addClass('active');
        }
    },

    /*--------------------------------------Initialize/Render Items---------------------------------------------- */
    getCookie: function() {
        var nameEQ = "sessionCookie" + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
    },

    initItems:  function () {
        var fullItems = this.getItemsFull();
    },

    getItemsFull: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-items',
            data: {
                serialNumber: App.serialNumber,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.renderItems(data.items);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({
                        html: '{Literal}There was a problem fetching data from the server{/Literal}'
                    });
                }
            }
        });
    },

    renderItems: function (data) {
        var that = this;
        this.generateItemsStyleMapping(data);

        data.sort(function (a, b) {
            return a.itemCode < b.itemCode ? -1 : (a.itemCode > b.itemCode ? 1 : 0);
        });
        
        itemsCollectionCut = new ItemsCollection();
        for (var i = 0; i < data.length; i++) {
            var currentItems = data[i];
            currentItems.cardStyleClass = that.itemsStyleMapping[data[i].itemCode];
            itemsCollectionCut.add(new Items(currentItems));
        }
        that.collection.reset(itemsCollectionCut.models);
        that.fullCollection = that.collection;
        that.searchableCollection = that.collection;
    },

    /*--------------------------------------Update/Save Model---------------------------------------------- */

    getFormValues: function () {
        var id = this.$el.find('#id').val();
        var itemCode = this.$el.find('#itemCode').val();
        var description = this.$el.find('#description').val();
        var price = this.$el.find('#price').val();
        var productLine = this.$el.find('#product-line').val();
        if (id == '') {
            id = Math.floor(Math.random() * 10000) + 1;
        }
        var updatedModel = {
            id: id,
            itemCode: itemCode,
            description: description,
            price: price,
            productLineId: productLine,
            isChanged: true
        };

        this.itemsFormView.model.set(updatedModel);
    },

    validateId: function () {
        var validateItemId = this.$el.find("#itemCode").val();
        if (validateItemId.trim().length < 1) {
            this.$el.find("#itemCode").addClass("invalid");
        }
        else {
            var iChars = "`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
            for (var i = 0; i < validateItemId.length; i++) {
                if (iChars.indexOf(validateItemId.charAt(i)) != -1) {
                    this.$el.find("#itemCode").addClass("invalid");
                    break;
                }
            }
        }
    },

    validateDescription: function () { 
        var validateDescription = this.$el.find("#description").val();
        if (validateDescription.trim().length < 1) {
            this.$el.find("#description").addClass("invalid");
        }
        else {
            var iChars = "`~!@$%^&*()_+=[]{};,<>/?*\\\'\"";
            for (var i = 0; i < validateDescription.length; i++) {
                if (iChars.indexOf(validateDescription.charAt(i)) != -1) {
                    this.$el.find("#description").addClass("invalid");
                    break;
                }
            }
        }
    },

    validatePrice: function () {
        var validatePrice = this.$el.find("#price").val(); 
        if (validatePrice.trim().length < 1) {
            this.$el.find("#price").addClass("invalid");
        }
        else if (validatePrice.indexOf("-") > -1 || validatePrice.indexOf('e') > -1) {
            this.$el.find("#price").addClass("invalid");
        }
        else if (validatePrice > 999999) {
            this.$el.find("#price").addClass("invalid");
        }
    },

    validateForm: function () {
        var valid = true;

        var validateDescription = this.$el.find("#description").val();
        if (validateDescription.trim().length < 1) {
            this.$el.find("#description").addClass("invalid");
            valid = false;
        }
        else {
            var iChars = "`~!@#$%^&*()_+=[]{}:;,<>/?*\\\'\"";
            for (var i = 0; i < validateDescription.length; i++) {
                if (iChars.indexOf(validateDescription.charAt(i)) != -1) {
                    this.$el.find("#description").addClass("invalid");
                    valid = false;
                    break;
                }
            }
        }

        var validateItemId = this.$el.find("#itemCode").val();
        if (validateItemId.trim().length < 1) {
            this.$el.find("#itemCode").addClass("invalid");
            valid = false;
        }
        else {
            var iChars = "`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
            for (var i = 0; i < validateItemId.length; i++) {
                if (iChars.indexOf(validateItemId.charAt(i)) != -1) {
                    this.$el.find("#itemCode").addClass("invalid");
                    valid = false;
                    break;
                }
            }
        }
    
        var validatePrice = this.$el.find("#price").val(); 
        if (validatePrice.trim().length < 1) {
            this.$el.find("#price").addClass("invalid");
            valid = false;
        }
        else if (validatePrice.indexOf("-") > -1 || validatePrice.indexOf('e') > -1) {
            this.$el.find("#price").addClass("invalid");
            valid = false;
        }
        else if (validatePrice > 999999) {
            this.$el.find("#price").addClass("invalid");
            valid = false;
        }

        return valid;
    },

    saveItems: function (){
        var items;
        var that = this;
        var validation = this.validateForm();
        var updateCollection = that.collection;
        
        if(validation) {
            this.getFormValues();
            var sessionToken = this.getCookie();
            newItem = (that.itemsFormView.model);
            updateCollection.add(newItem);
            $.ajax({
                url: '/data/save-items',
                data: {
                    serialNumber: App.serialNumber,
                    items: JSON.stringify(updateCollection.toJSON()),
                    token: sessionToken
                },
                dataType: 'json',
                type: 'POST',
    
                success: function (data) {
                    M.toast({ html: '{Literal}Item updated successfully{/Literal}' });
                },
    
                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem saving this item{/Literal}' });
                    }
                }
            });

            this.render();
        }
        else {
            M.toast({ html: '{Literal}Some of the required fields are missing or invalid{/Literal}' });
        }
    },

    /*--------------------------------------Delete Modals---------------------------------------------- */

    deletionModal: function (e) {
        var that = this;
        var element = $(e.currentTarget);
        var itemsId = $(element).attr('data-id');
        $("#delete-items-id").val(itemsId);
        $('#delete-items-modal').modal().modal('open');
    },

    deleteItems: function(e) {
        var element = $(e.currentTarget);
        var itemsId = $(element).attr("data-items-id");
        var that = this;
        var sessionToken = this.getCookie();
        var updateCollection = that.collection;
        this.itemsFormView.model.attributes.isRemoved = true;
        $.ajax({
            url: '/data/save-items',
            type: 'POST',
            data: {
                serialNumber: App.serialNumber,
                items: JSON.stringify(updateCollection.toJSON()),
                token: sessionToken
            },

            success: function (data) {
                that.collection.remove(itemsId);

                M.toast({ html: '{Literal}Item deleted successfully{/Literal}'});
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem deleting this item{/Literal}' });
                }
            }
        });
        this.render();
    },

    proceedToNextPage: function () {
        $('#items-gray').hide();
        $('#items-blue').hide();
        $('#items-green').show();
        window.location.href = "#/completed";
    },

    openPreviousPage: function () {
        window.location.href = "#/product-lines";
    },
});
