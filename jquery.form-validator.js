/*!
* jQuery formValidator Plugin v0.2
* https://github.com/borutpiletic/jquery-form-validator
*
* Copyright 2013 Borut Piletic - http://borutpiletic.net
* Released under the MIT license
*/
(function($) {
    
    // Create a plugin constructor
    jQuery.fn.formValidator = function(options)
    {
        if(options == undefined)
            options = {};
        
        // Set form selector
        options.formSelector = this.selector;
        
        // Set form validator options
        FormValidator.setOptions(options);
        
        // Run default validation onsubmit form
        $(this).bind('submit', function(event)
        {
            FormValidator.validate(this, options);
            
            if(FormValidator.isFormInvalid)
                return false;
            else
                // Form validators passed, safe to trigger submission
                FormValidator.triggerHook('beforeSubmit', this, event);
        });
        
        // Run live validation
        if(options.validateLive != undefined && options.validateLive == true)
        {
            FormValidator.setOptions(options);
            FormValidator.validateLive();
        }
    };
    
    // Validation class
    FormValidator = {

        isFormInvalid: false,
        
        isElementInvalid: false,
        
        options: null,

        setOptions: function(options)
        {
             this.options = options;

             // Set default options
             if(this.options.stopOnInvalid == undefined)
                 this.options.stopOnInvalid = false;
             
             if(this.options.validateLiveDelay == undefined)
                 this.options.validateLiveDelay = 1000;
             
             if(this.options.formSelector == undefined) 
                 throw new Error('No form selector specified');
        },

        triggerHook: function(name, element, data)
        {
            if(FormValidator.options[name] != undefined)
                FormValidator.options[name](element, data);
        },
        
        getFormElements: function()
        {
            return $(
              this.options.formSelector + ' input:visible, ' + 
              this.options.formSelector + ' checkbox:visible, ' +
              this.options.formSelector + ' select:visible, ' +
              this.options.formSelector + ' textarea:visible '
            );
        },

        validate: function(form, options)
        {
            this.setOptions(options);
            
            var elements = this.getFormElements();
            
            // Before form validation event
            FormValidator.triggerHook('beforeValidate', form);
               
            // Validate all form elements
            $.each(elements, function(i, element)
            {
                FormValidator.validateElement(element);
                
                if(FormValidator.options.stopOnInvalid)
                {
                    if(FormValidator.isElementInvalid)
                        return false;
                }          
            });

            // After form validation event
            FormValidator.triggerHook('afterValidate', form);
            
            // Set validation status
            FormValidator.setFormValidationStatus(elements);
        },
        
        validateLive: function()
        {
            // Live form element validation
            var elements = this.getFormElements();
            var timeout = null;

            $.each(elements, function(i, element)
            {
               // Validation while typing
               $(element).bind('keyup, focusout', function(event)
               {
                   if(this.type == 'text' || this.type == 'textarea')
                   {
                        var element = this;
                        
                        clearTimeout(timeout);
                        
                        // Live validation with delay
                        if($(element).val())
                        {
                            timeout = setTimeout(function() {
                                FormValidator.validateElement(element);
                            }, FormValidator.options.validateLiveDelay);
                        }
                   }
               });            
            });
            
            // Set validation status
            FormValidator.setFormValidationStatus(elements);
        },
        
        setFormValidationStatus: function(elements)
        {
            var isInvalid = false;
            $.each(elements, function(i, element)
            {
               if($(element).attr('data-error') != undefined)
               {
                   isInvalid = true;
                   return;
               }
            });

            FormValidator.isFormInvalid = (isInvalid) ? true : false;
        },
        
        validateElement: function(element)
        {
            // Check element for validators
            if( $(element).attr('class') != undefined && $(element).attr('class').indexOf('validator') > -1 )
            {
                // Reset element errors indicator
                FormValidator.isElementInvalid = false;
                $(element).removeAttr('data-error');
                
                // If element is optional and has no value - skip validation
                if(element.value.length == 0 && $(element).attr('class').indexOf('validator-required') == -1)
                    return true;                
                
                // Element validation start event                
                FormValidator.triggerHook('onValidate', element);
                
                // Get element validators
                var validators = $(element).attr('class').toLowerCase().match(/validator-[a-z\-]+/g);
                
                // Run single validation 
                if(validators.length == 1)
                {
                    var validatorName = validators[0].substr(10);

                    if( !FormValidator.runValidator(validatorName, element) )
                    {
                        // Element has errors indicator
                        $(element).attr('data-error', true);
                        
                        FormValidator.isElementInvalid = true;
                        FormValidator.triggerHook('onInvalid', element, { validatorName : validatorName });                               
                    }
                    else
                    {
                        // Reset valid indicator for every validation                        
                        if($(element).attr('data-error') == undefined)
                        {
                            FormValidator.isElementInvalid = false;
                            FormValidator.triggerHook('onSuccess', element);
                        }
                    }
                    
                    // onInvalid event - trigger only when 1st error occurs
                    if($(element).attr('data-error') != undefined)
                        FormValidator.triggerHook('onError', element);                    
                }
                
                // Multiple rules validation
                else if(validators.length > 1)
                {
                    FormValidator.triggerHook('beforeValidate', element);

                    for (i = 0; i < validators.length; i++) 
                    {
                        var validatorName = validators[i].substr(10);
                        
                        if( !FormValidator.runValidator(validatorName, element) )
                        {
                            FormValidator.isElementInvalid = true;
                            
                            // Set element error 
                            $(element).attr('data-error', true);
                            
                            FormValidator.triggerHook('onInvalid', element, {validatorName: validatorName});
                        }
                        else
                        {
                            // Reset valid indicator validation
                            // After all validators succesfuly passed
                            if( $(element).attr('data-error') == undefined)
                            {
                                FormValidator.isElementInvalid = false;
                                FormValidator.triggerHook('onSuccess', element);
                            }
                        }
                    }
                    
                    // onInvalid event - trigger only when 1st error occurs
                    if($(element).attr('data-error') != undefined)
                        FormValidator.triggerHook('onError', element);
                }
            }
        },
        
        runValidator: function(name, element)
        {
            switch(name)
            {
                case 'required':
                    return this.validatorRequired(element);
                break;

                case 'number':
                    return this.validatorNumber(element);
                break;

                case 'length':
                    return this.validatorLength(element);
                break;

                case 'email':
                    return this.validatorEmail(element);
                break;

                case 'url':
                    return this.validatorUrl(element);
                break;

                case 'compare':
                    return this.validatorCompare(element);
                break;                   

                case 'regexp':
                    return this.validatorRegExp(element);
                break; 
            }
        },

        //
        // Element validators 
        //           
        validatorRequired: function(element)
        {
            var isValid = false;

            switch(element.type)
            {
                case 'checkbox':

                    if ($(element).attr('checked') != undefined)
                        isValid = true;

                break;

                case 'radio':

                    var radioGroup = $('input:radio[name="' + element.name + '"]');

                     $.each(radioGroup, function(i, element)
                     {
                         if($(element).attr('checked') != undefined)
                         {
                            isValid = true; 
                            return;
                         }
                     });

                break;

                default:

                    if($(element).val().length > 0)
                        isValid = true;
            }

            return isValid;
        },

        validatorNumber: function(element)
        {
            return !isNaN($(element).val());
        },

        validatorLength: function(element)
        {
            var validLength = $(element).attr('data-valid-length');

            if(validLength == undefined)
                throw new Error('Missing data-valid-length attribute');
            
            // Length validation with range
            if(validLength.indexOf(',') > 0)
            {
                var range = validLength.split(',');
                var min = range[0];
                var max = range[1];

                if($(element).val().length < min || $(element).val().length > max)
                    return false;

                return true;
            }
            else
                return ( $(element).val().length >= parseInt(validLength) ) ? true : false;
        },

        validatorEmail: function(element)
        {
            var emailRegExp = /^[\w\.]+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/i;               
            return ( emailRegExp.test($(element).val()) ) ? true : false;
        },

        validatorUrl: function(element)
        {
            var urlRegExp = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/i;               
            return ( urlRegExp.test($(element).val()) ) ? true : false;
        },

        validatorCompare: function(element)
        {
            var compare = $(element).attr('data-valid-compare');

            if(compare == undefined)
                throw new Error('Missing data-valid-compare attribute');

            return ( compare == $(element).val() ) ? true : false;
        },

        validatorRegExp: function(element)
        {
            var regExp = $(element).attr('data-valid-regexp');
            var regExpMod = $(element).attr('data-valid-regexp-modifiers');

            if(regExp == undefined)
                throw new Error('Missing data-valid-regexp attribute');

            if(regExpMod != undefined)
                regExp = new RegExp(regExp, regExpMod);
            else 
                regExp = new RegExp(regExp);

            return ( regExp.test($(element).val()) ) ? true : false;
        }
    };
})(jQuery);
