/*
This script file is created for capturing dynamic UDO variables on overlay pages. eg. login, registration, forgot password etc..
This script file also captures manual linking for external websites. e.g Mattel top navigations Toy factory, shop, videos, Games
*/
var pageId = '';
var brand = '';
var country = '';
var categoryId = '';
var division = '';
var ipAddress = '';
var language = '';

var pageName = document.title;
var pageSubType = '';
var pageType = '';
var pageUrl = '';
var platform = '';
var refferrerUrl = document.referrer != null ? document.referrer : '';
var requestedUrl = window.location.href;
var siteSection = '';
var siteType = '';

$(document).ready(function () {

    if (document.getElementById('hdnpageId') != null) {
        pageId = document.getElementById('hdnpageId').value;
    }

    if (document.getElementById('hdnplatform') != null) {
        platform = document.getElementById('hdnplatform').value;
    }

    if (document.getElementById('hdncountry') != null) {
        country = document.getElementById('hdncountry').value;
    }
    if (document.getElementById('hdnlanguage') != null) {
        language = document.getElementById('hdnlanguage').value;
    }
    if (document.getElementById('hdnsiteSection') != null) {
        siteSection = document.getElementById('hdnsiteSection').value;
    }
    if (document.getElementById('hdnsubType') != null) {
        siteType = document.getElementById('hdnsubType').value;
    }
    if (document.getElementById('hdnuserIPAddres') != null) {
        ipAddress = document.getElementById('hdnuserIPAddres').value;
    }

    if (document.getElementById('hdnPageType') != null) {
        pageType = document.getElementById('hdnPageType').value;
    }



//$('#test_button').live("click", function(){
  //alert('test');
//});
    //Header Menu

    $('#mdn-top-nav li > a').live("click",function () {
       
        var currentAnchor = $(this);
        var linkurl = currentAnchor.attr('href');
        var linktext = currentAnchor.attr('title');
        UTagExternalLink(linkurl, linktext, pageId);
    });
	
	

    //Footer Menu
    $('.ft-inline-wrap li  > a').click(function () {
      
        var currentAnchor = $(this);
        var linkurl = currentAnchor.attr('href');
        var linktext = currentAnchor.attr('title');
        UTagExternalLink(linkurl, linktext, pageId);
    });

    //Above Footer Menu
    $('.ft-row-wrap li  > a').click(function () {
      
        var currentAnchor = $(this);
        var linkurl = currentAnchor.attr('href');
        var linktext = currentAnchor.attr('title');
        UTagExternalLink(linkurl, linktext, pageId);
    });

    //Below Footer Menu
    $('.local .clearfix li  > a').click(function () {
       
        var currentAnchor = $(this);
        var linkurl = currentAnchor.attr('href');
        var linktext = currentAnchor.attr('title');
        UTagExternalLink(linkurl, linktext, pageId);
    });

    //Videos
    $('.holder').click(function () {
       
        var currentAnchor = $(this);
        var subtype = currentAnchor.attr('data-video-title');
		
        setUTagView(subtype);
    });


    //country list
    $("select").change(function () {
       

        $("select option:selected").each(function () {
            var currentAnchor = $(this);
           var linkUrl = currentAnchor.val();
            if (linkUrl.indexOf('http') == -1) {
                linkurl = window.location.host + linkUrl;
            }   
            var linktext = currentAnchor.text();
            
            UTagExternalLink(linkurl, linktext, pageId);
        });

    });
	
	

//Careers page
	$('.btn-inline').live("click", function () { 
	var anchor = $(this);	 	
	  var span = anchor.children('span');		 
	 var linkurl = anchor.attr('href');
        var linktext = span.text();		
		
        UTagExternalLink(linkurl, linktext, pageId);
	  
    });
	
	$('.main-nav li > a').live("click", function () { 	
	var anchor = $(this);	 	
	  var span = anchor.children('span');		 
	 var linkurl = anchor.attr('href');
        var linktext = span.text();
		 UTagExternalLink(linkurl, linktext, pageId);
	  
    });

	
	//Shop Barbie 
	
	$('.btn-shop').live("click", function () { 	
	var anchor = $(this);	 	
	  var span = anchor.children('span');		 
	 var linkurl = anchor.attr('href');
        var linktext = span.text();
		//alert(linktext);
		 UTagExternalLink(linkurl, linktext, pageId);
	  
    });
	//Download
	$('.btn-download').live("click", function () { 	
	var anchor = $(this);	 	
	  var span = anchor.children('span');		 
	 var linkurl = anchor.attr('href');
        var linktext = span.text();
		//alert(linktext);
		SetDownloads(linktext, linkurl);
	  
    });
	
	
	//Home Page

$('.button_holder ul li > a').live("click", function () { 	
	var anchor = $(this);	 	
	  var span = anchor.children('span');		 
	 var linkurl = anchor.attr('href');
        var linktext = span.text();
		if(linkurl == '')
		linkurl = window.location.href;
		
		 UTagExternalLink(linkurl, linktext, pageId);
	  
    });
/*
	$('.cloud_btn').live("click", function () { 	
	var anchor = $(this);	 	
	  var span = anchor.children('span');		 
	 var linkurl = anchor.attr('href');
        var linktext = span.text();
		
		UTagExternalLink(linkurl, linktext, pageId);
	  
    });
	*/
	$('.One_button_holder ul li > a').live("click", function () { 	
	var anchor = $(this);	 	
	  var span = anchor.children('span');		 
	 var linkurl = anchor.attr('href');
        var linktext = span.text();
	
		 UTagExternalLink(linkurl, linktext, pageId);
	  
    });
	
	$('.btn-med').live("click", function () { 	
	var anchor = $(this);	 	
	 var para = anchor.children('p');
	  var span = para.children('span');		 
	 var linkurl = anchor.attr('href');
        var linktext = span.text();		
		
		 UTagExternalLink(linkurl, linktext, pageId);
	  
    });
	
	$('.promo-tile a').click(function () { 	
	var anchor = $(this);
	var span = anchor.children('span');		 
	 var linkurl = anchor.attr('href');
        var linktext = span.text();		
		
		 UTagExternalLink(linkurl, linktext, pageId);
	  
    });
	$('#header-top a').click(function () { 	
	var anchor = $(this);
	var img = anchor.children('img');		 
	 var linkurl = anchor.attr('href');
        var linktext = img.attr('alt');
		
		 UTagExternalLink(linkurl, linktext, pageId);
	  
    });

 
 

});

function SetDownloads(pdfid, pdflink)
{
utag.link({event_id: pdfid, event_category_id: 'Downloads' ,event_action_type:'PDF', event_detail_attr47:  pdflink});

}

//For Videos
function setUTagView(videosubtype) {

    //alert(" page_id: "+pageId+", site_Type_attr2: "+siteType+", site_Country_attr3: "+country+", platform_attr5:"+ platform+", language_attr7:"+ language+", site_section_attr8: "+siteSection+", page_name_attr9: "+pageName+",  page_type_attr10: "+pageType+", page_subtype_attr11: "+videosubtype+", referring_url_attr12: "+refferrerUrl+",requested_url_attr13: "+requestedUrl+",  ip_address_attr14:"+ ipAddress);
pageId = window.location.href;
    utag.view(
{
    page_id: pageId,
    site_Type_attr2: siteType,
    site_Country_attr3: country,
    platform_attr5: platform,
    language_attr7: language,
    site_section_attr8: siteSection,
    page_name_attr9: pageName,
    page_type_attr10: pageType,
    page_subtype_attr11: videosubtype,
    referring_url_attr12: refferrerUrl,
    requested_url_attr13: requestedUrl,
    ip_address_attr14: ipAddress,
    tm_page_type: pageType


});

}


function UTagExternalLink(linkUrl, linkName, pageId) {
    utag.link({ link_url: linkUrl, link_name: linkName, page_id: pageId });
}

