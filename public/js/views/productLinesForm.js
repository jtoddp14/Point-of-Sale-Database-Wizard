var ProductLineFormView = Backbone.View.extend({
    
    events: {
        'change #item-type' : 'createNewItemType',
        'change #menu-page' : 'createNewMenuPage'
    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.productLines = options.productLines;
        this.itemTypes = options.itemTypes;
        this.menuPages = options.menuPages;
    },

    render: function () {
        var that = this;
        this.$el.detach();
        
        this.$el.html(this.template({
            productLine: this.model.toJSON(),
            itemTypes: this.itemTypes,
            menuPages: this.menuPages,
        }));

        $(document).ready(function() {
            $('.tooltipped').tooltip();
            $('select').formSelect();
        });

        return this;
    },

    createNewItemType: function () {
        var itemType = this.$el.find('#item-type option:selected').text();

        if (itemType == "Create New Item Type") {
            this.$el.find('#item-type-form-modal').show();
        }
    },

    createNewMenuPage: function () {
        var menuPage = this.$el.find('#menu-page option:selected').text();
        if (menuPage == "Create New Menu Page") {
            this.$el.find('#menu-page-form-modal').show();
        }
    }
});
