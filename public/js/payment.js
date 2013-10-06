
(function() {
  $(function() {
    $('#registrationForm').validate(
      {
        debug: true,
        errorPlacement: function(error, element) {
          // if the input has a prepend or append element, put the validation msg after the parent div
          if(element.parent().hasClass('input-prepend') || element.parent().hasClass('input-append')) {
            error.insertAfter(element.parent());    
          // else just place the validation message immediatly after the input
          } else {
            error.insertAfter(element);
          }
        },
        errorElement: "div", // contain the error msg in a small tag
        errorClass : 'help-block error',
        wrapper: "div", // wrap the error message and small tag in a div
        highlight: function(element) {
          $(element).closest('.control-group').addClass('error'); // add the Bootstrap error class to the control group
        },
        success: function(element) {
          var $group = $(element).closest('.control-group');
          $group.removeClass('error'); // remove the Boostrap error class from the control group
          $group.find('.temp').remove();
        },
        submitHandler : function(form) {
          var $form = $(form);
          var $button = $form.find('button[type="submit"]');
          
        }
      });
  }); //end ready
}).call(this);