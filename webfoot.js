var Webfoot = Webfoot || {};
var Site = Site || {};
var error;
var debug = false;

// Helper function to create namespace
Webfoot.namespace = function(namespaceString) {
    var parts = namespaceString.split('.'),
        parent = window,
        currentPart = '';    

    for(var i = 0, length = parts.length; i < length; i++) {
        currentPart = parts[i];
        parent[currentPart] = parent[currentPart] || {};
        parent = parent[currentPart];
    }

    return parent;
};

Webfoot.url = {
    addToCart: 'Ajax.aspx?CN=98A129E595F9',
    changeCountry: 'Fetch.aspx?CN=2EF841540163'
}; 
Webfoot.submit = function (options) {
    var defaults = {
        action: 'U',
        form: '#myForm'
    };
    var properties = $.extend({}, defaults, options);
    $('#tbAction').val(properties.action);
    if (!error) {
        $(properties.form).submit();
    }
};
Webfoot.redirect = function (url) {
    window.location = url;
};
Webfoot.addToCart = function (options) {
    var defaults = {
        contentid: '',
        name: '',
        dimensionid: '',
        quantity: 1
    };
    var properties = $.extend({}, defaults, options);
    var data = 'ITEMID=' + properties.contentid + '&HLTYPE=ADD' + '&DIMENSIONID=' + properties.dimensionid + '&quantity=' + properties.quantity;
    Webfoot.loading({
        element: 'body',
        overlay: true
    });
    $.ajax({
        type: 'GET',
        url: Webfoot.url.addToCart,
        data: data,
        beforeSend: function () {
            Webfoot.notify({
                message: 'Adding ' + properties.name + ' to cart...'
            });
        },
        success: function () {
            Webfoot.notify({
                message: 'Added to cart',
                type: 'success',
                duration: 10000
            });
        },
        error: function () {
            Webfoot.notify({
                message: 'Error adding to cart',
                type: 'error'
            });
        }
    });
};
Webfoot.notify = function (options, callback) {
    var defaults = {
        message: '',
        duration: 2000,
        type: '',
        theme: '',
        element: 'body'
    };
    var properties = $.extend({}, defaults, options);
    var element = properties.element;
    var html;
    $('.wfnotify').remove();
    if (properties.type === '') {
        html = '<div class="wfnotify ' + properties.theme + '"></div>';
        $(element).prepend(html);
        $('.wfnotify').html(properties.message);
    } else {
        html = '<div class="wfnotify ' + properties.type + ' ' + properties.theme + '"><span></span></div>';
        $(element).prepend(html);
        $('.wfnotify span').html(properties.message);
    }
    var marginleft = ($('.wfnotify').outerWidth() / 2) * -1 + 'px';
    var margintop = ($('.wfnotify').outerHeight() / 2) * -1 + 'px';
    console.log('marginLeft :' + marginleft + ', marginTop: ' + margintop);
    $(element).css('position', 'relative');
    $('.wfnotify').css({
        'margin-top': margintop,
        'margin-left': marginleft
    });
    if (properties.duration !== null) {
        setTimeout(function () {
            $('.wfnotify').fadeOut(function () {
                $(element).removeAttr('style');
                $('.wfnotify').remove();
                if (typeof (callback) === 'function' && callback !== undefined) {
                    callback();
                }
            });
        }, properties.duration);
    }
    if (options === 'destroy') {
        $('.wfnotify').fadeOut(function () {
            $('.wfnotify').remove();
        });
    }
};
Webfoot.loading = function (options) {
    var defaults = {
        element: '',
        theme: 'loading',
        height: null,
        preserveWidth: false,
        stop: '',
        overlay: false
    };
    var properties = $.extend({}, defaults, options);
    var originalWidth;
    var element = properties.element;
    if (properties.overlay) {
        $(element).prepend('<div class="overlay"><div class="' + properties.theme + '"></div></div>');
        $('.overlay').ajaxSuccess(function () {
            $(this).remove();
        });
    } else {
        $(element).bind('ajaxSend', function () {
            originalWidth = $(this).width();
            var height = $(this).height();
            if (height <= 20) {
                height = 50;
            } else if (properties.height !== null) {
                height = properties.height;
            }
            $(this).html('').width(originalWidth).height(height).addClass(properties.theme);
        }).bind('ajaxSuccess', function () {
            var width;
            if (properties.preserveWidth === true) {
                width = originalWidth;
            } else {
                width = 'auto';
            }
            $(this).width(width).height('auto').removeClass(properties.theme);
            $(this).unbind("ajaxSend ajaxSuccess");
            if (typeof (properties.stop) === 'function' && properties.stop !== undefined) {
                properties.stop();
            }
        }).ajaxError(function (e, xhr, settings, exception) {
            Webfoot.notify({
                message: 'error: ' + exception,
                type: 'error'
            });
        });
    }
};
Webfoot.validate = function (options) {
    var defaults = {
        form: '#myForm'
    };
    var properties = $.extend({}, defaults, options);
    if (jQuery().validate) {
        $(properties.form).validate();
    } else {
        Webfoot.debug({
            error: 'lib/common/js/jquery.validate.js not inlcuded on the page',
            detail: 'Webfoot.validate() relies on the third-party jQuery.validate() plugin',
            solution: 'Please link it to the page template to correct this issue'
        });
        error = true;
    }
};
Webfoot.enter = function (options, callback) {
    var defaults = {
        element: ''
    };
    var properties = $.extend({}, defaults, options);
    var $element = $(properties.element);
    $element.keydown(function (event) {
        var code = (event.keyCode ? event.keyCode : event.which);
        if (code === 13) {
            if (typeof callback === 'function') {
                callback.call(this);
            }
            event.preventDefault();
            return false;
        }
    });
};
Webfoot.changecountry = function(el, options){
	var defaults = {
        	countryField: '#tbCOUNTRY',
        	stateField: '#tbSTATE',
        	stateLabel: 'label[for=tbSTATE]',
        	zipcodeField: "#tbZIPCODE",
        	zipcodeLabel: 'label[for=tbZIPCODE]',
		firstOption: false,
		firstOptionText: '',
		complete: ''
    	};

	// To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;

        // Add a reverse reference to the DOM object
        base.$el.data("changecountry", base);	

        base.init = function () {
            base.options = $.extend({}, defaults, options);
            
	    // Put your initialization code here
	    var currentcountry = base.$el.find(base.options.countryField).data();
	    var currentstate = base.$el.find(base.options.stateField).data();
	    var zipcodeHasValue = false;
	    if(base.$el.find(base.options.zipcodeField).val() == '!ZIPCODE!'){
		zipcodeHasValue = false;
	    } else if(base.$el.find(base.options.zipcodeField).val() !== ''){
	    	zipcodeHasValue = true;
	    }
	    setTimeout(function(){ base.setCountry(currentcountry.value); }, 1);
            base.$el.find(base.options.countryField).live('change', function () {
                if(!zipcodeHasValue){
			base.clearFields();
		}
                base.setZipcodeClass($(this).val());
                base.loadCountry(function(){
			base.setState(currentstate.value);
		});
		zipcodeHasValue = false;
            });
        };

        // Sample Function, Uncomment to use
        // base.functionName = function(paramaters){
        //
        // };
	base.setCountry = function(country){

	    if(country === '' || country == '!COUNTRY!'){
		base.$el.find(base.options.countryField).val('US').trigger('change');
  	    } else {
		base.$el.find(base.options.countryField).val(country).trigger('change');
	    }

	}
	base.setState = function(state){
	    if(state != '!STATE!' || state !== ''){
		base.$el.find(base.options.stateField).val(state);
  	    }
	}
        base.clearFields = function () {
           base.$el.find(base.options.zipcodeField).val('');
        }
        base.setZipcodeClass = function (country) {
            if (country === "US") {
                base.$el.find(base.options.zipcodeField).removeClass('postalcode').addClass('zipcode');
            } else if (country === 'AR' || country === 'BM' || country === 'BN' || country === 'CA' || country === 'MT' || country === 'NL' || country === 'GB' || country === 'VE') {
                base.$el.find(base.options.zipcodeField).removeClass('zipcode').addClass('postalcode');
            }
        }
        base.loadCountry = function(callback) {
            $.getJSON(Webfoot.url.changeCountry + '&COUNTRYCODE=' + base.$el.find(base.options.countryField).val(), function (data) {
                base.$el.find(base.options.stateLabel).text(data.STATELABEL);
                if(base.options.firstOption === true){
			base.$el.find(base.options.stateField).html('<option value="">' + base.options.firstOptionText + '</option>');
			base.$el.find(base.options.stateField).append(data.STATEOPTIONLIST2);
		} else {
			base.$el.find(base.options.stateField).html(data.STATEOPTIONLIST2);
		}
                base.$el.find(base.options.zipcodeLabel).text(data.ZIPCODELABEL);
		callback();
		if (typeof base.options.complete == "function") {
			base.options.complete(data);
                }
            });
        }

        // Run initializer
        base.init();
};
Webfoot.debug = function (options) {
    if (!debug) {
        return;
    }
    var defaults = {
        error: '',
        detail: '',
        solution: ''
    };
    var properties = $.extend({}, defaults, options);
    if (!$('.wfdebug').length) {
        $('body').append('<div class="wfdebug"><a href="#collapse" class="collapse"></a><h1>Webfoot Debug</h1><div class="inner"></div></div>');
    }
    if (properties.error !== '') {
        if (!$('.wfdebug .errors').length) {
            $('.wfdebug .inner').append('<div class="errors"><h2>Webfoot Errors</h2><ul></ul></div>');
        }
        $('.wfdebug .errors ul').append('<li><dl><dt>' + properties.error + '</dt><dd class="detail">' + properties.detail + '</dd><dd class="solution">' + properties.solution + '</dd></dl></li>');
    }
    $('.wfdebug .inner').append('<div class="page-settings"></div>');
    $('.wfdebug .page-settings').load('ajax.aspx?CN=BDBDB40CED06&CONTENTID=' + $('#tbCN').val());
    $('.wfdebug .inner').append('<div class="browser" align="right">Your browser: ' + navigator.userAgent + '</div>');
    $('.wfdebug [href=#collapse]').live('click', function () {
        if ($('.wfdebug .inner').is(':visible')) {
            $('.wfdebug .inner').animate({
                height: 'toggle'
            }, 500);
            $(this).removeClass('collapse').addClass('expand');
        } else {
            $('.wfdebug .inner').animate({
                height: 'toggle'
            }, 500);
            $(this).removeClass('expand').addClass('collapse');
        }
        return false;
    });
};
Webfoot.debug.enable = function () {
    debug = true;
};