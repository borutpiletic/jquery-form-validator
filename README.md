# jQuery form validation plugin (`formValidator`)

> **This plugin was written in 2013 and is not being maintained since.**

This simple form validatior plugin purpose is to be a "lightweight & simple to use" backbone for
various form validation adventures.

## Installation

```html
<script src="/jquery.form-validator.js" type="text/javascript"></script>
```

### Usage example

```js
$('#my-form').formValidator({
    // Stop validating after one validation failed.
    stopOnInvalid: false,
    // Validate while user is typing.
    validateLive: true,
    // Delay n miliseconds before validator is triggered.
    validateLiveDelay: 1000,
    // Event callbacks (hooks)
    onError: function(element)
    {
        // do somthing cool with your element
    },
    onInvalid: function(element, data)
    {
        // do somthing cool with your element
    },
    onSuccess: function(element)
    {
        // do somthing cool with your element
    }
});
```

## Supported validators

**`email`**\
Used for validating email addresses. Checking against proper email format.

Supported attributes: none

**`required`**\
Used for validating required form fields, which are required - thus cannot be empty.

> IMPORTANT: Optional elements should not have "validator-required" declared. Use "validator-required" only on elements
where user input is mandatory, else validation will only be performed on elements that have validator declared and element
value has been set.

NOTE:
 * When working with radio buttons group (same name attribute) you must add validator-required class to only 1 element,
    the rest group will be checked automatically.
 * When using required on select element, make sure first element option has attribute value set to empty, else its value
will be same as option text (which means it has value).

Supported attributes: none

Example:

Select menu requires to select at least one option

```html
<select name="age" class="validator-required">
    <option value="">Please select your age</option>
    <option value="18-30">18-30</option>
    <option value="30-50">30-50</option>
</select>
```

Required radio button group
```html
<input name="userGender" type="radio" class="validator-required" value="female" /> Female
<input name="userGender" type="radio" value="male" /> Male
```
Because radio button group elements have the same name, complete group will be checked.

**`numbers`**\
Used for validating numbers input.

Supported attributes: none

**`length`**\
Used for validating input length.

Supported attributes:
- `data-valid-length`: Length to validate against specified in format "min,max" or to check less than "value".

**`regexp`**\
Used for validating values against custom regular expression.

Supported attributes:
- `data-valid-regexp`: Regular expression to validate against.
- `data-valid-regexp-modifiers`: Additional regular expression modifiers.

**`compare`**\
Used for validating input against simple specified value. For more complex comparison, rather
use regexp validator because this validator comparison is absolute.

Supported attributes:
- `data-valid-compare`: Value to make absolute comparison against.

**`url`**\
Used for validating URL formats. It currently supports http, https and ftp schemes.
For more complex validation, you can use `regex` validator.

Supported attributes: none

### Validator options

- `validateLive` (boolean) - whenever live validation should be performed (as you type) | default: false
- `validateLiveDelay` (int) - delay in miliseconds before live validator is triggered | default: 1000
- `stopOnInvalid` (boolean) - stop form validation when first element validation fails | default: false

### Validator hooks

Currently there is 7 hooks avaliable to hook into validation execution and give you control of what to do with an element at the certain point of validation process.

- `onInvalid`: called when element validator fails (executed for each validator). Additional data object containing validator name.
    Return: element, data
- `onError`: called when element has error (executed for each element)
    Recieves: element
- `onSuccess`: called when element validation passes (executed for each element)
    Recieves: element
- `onValidate`: called before element validation begins (executed for each element)
  Recieves: element
- `beforeSubmit`: form has passed all validators, calling this hook before form submission is triggered
    Recieves: form, event
- `beforeValidate`: called before form validation begins
    Recieves: form
- `afterValidate`: called after form validation ends
    Recieves: form