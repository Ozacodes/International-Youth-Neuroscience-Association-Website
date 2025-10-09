//jquery-click-scroll
//by syamsul'isul' Arifin

var sectionArray = [1, 2, 3, 4, 5];

$.each(sectionArray, function(index, value){
          
     $(document).scroll(function(){
         // Check if the section element exists before trying to access its offset
         var sectionElement = $('#' + 'section_' + value);
         if (sectionElement.length === 0) {
             return; // Skip if section doesn't exist
         }
         
         var offsetSection = sectionElement.offset().top - 75;
         var docScroll = $(document).scrollTop();
         var docScroll1 = docScroll + 1;
         
        
         if ( docScroll1 >= offsetSection ){
             $('.navbar-nav .nav-item .nav-link').removeClass('active');
             $('.navbar-nav .nav-item .nav-link:link').addClass('inactive');  
             $('.navbar-nav .nav-item .nav-link').eq(index).addClass('active');
             $('.navbar-nav .nav-item .nav-link').eq(index).removeClass('inactive');
         }
         
     });
    
    $('.click-scroll').eq(index).click(function(e){
        // Check if the section element exists before trying to access its offset
        var sectionElement = $('#' + 'section_' + value);
        if (sectionElement.length === 0) {
            return; // Skip if section doesn't exist
        }
        
        var offsetClick = sectionElement.offset().top - 75;
        e.preventDefault();
        $('html, body').animate({
            'scrollTop':offsetClick
        }, 300)
    });
    
});

$(document).ready(function(){
    // Only run if navbar elements exist
    if ($('.navbar-nav .nav-item .nav-link').length > 0) {
        $('.navbar-nav .nav-item .nav-link:link').addClass('inactive');    
        $('.navbar-nav .nav-item .nav-link').eq(0).addClass('active');
        $('.navbar-nav .nav-item .nav-link:link').eq(0).removeClass('inactive');
    }
});