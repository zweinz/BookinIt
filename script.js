var chunkSize = 5;
var cdnBase = 'http://s3.amazonaws.com/bookinit/';
var PAGE_NUMBER = 'pageNumber';

// from stack overflow
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if (results == null) return "";
    else return decodeURIComponent(results[1].replace(/\+/g, " "));
}

function cdnURL(pageNumber) {
    return cdnBase + getParameterByName('bookUnique') + '/page' + pageNumber + '.jpg';
}

function loadPageIntoDiv(img, div) {
    var pageNumber = img.data('pageNumber');
    var imgContainer = $(document.createElement('div')).addClass('item').addClass('page' + pageNumber);

    if ($('.item').length == 0) {
        imgContainer.addClass('active');
    }
    imgContainer.append(img);
    div.append(imgContainer);

    // add a select option for it
    var humanNumber = pageNumber + 1;
    $('select.print-select').append('<option value=' + pageNumber + '>Page ' + humanNumber + '</option>');

    // refresh data
    setPrintButton();
}

function loadImages(div, start) {
    for (var i = start; i < chunkSize + start; i++) {

        var img = $(document.createElement('img')).attr('src', cdnURL(i))
            .data(PAGE_NUMBER, i);

        loadPageIntoDiv(img, div);

        img.error(function () {
            var pageNumber = $(this).data(PAGE_NUMBER);

            // remove
            var parent = $(this).parent();
            parent.remove();
            
            $('select.print-select option[value=' + pageNumber + ']').remove();

            // refresh data
            setPrintButton();
        });

        img.load(function () {
            // if you're a multiple of chunkSize, then load the next Chunk
            var pageNumberPlus = $(this).data(PAGE_NUMBER) + 1;
            if (pageNumberPlus % chunkSize == 0) {
                loadImages(div, pageNumberPlus);
            }
        });
    }
}

function setPrintButton() {
    var pdfURL = cdnBase + getParameterByName('bookUnique') + '/book.pdf';
    var image = $('.item img')[0];
    var width = image.naturalWidth;
    var height = image.naturalHeight;

    var pages = $('.item').length;
    var src = pdfURL;
    var filetype = 'pdf';

    // width & height must be in mm.  assume 8.5 x 11
    if(width < height) {
        width = 215.9;
        height = 279.4;
    } else {
        width = 279.4;
        height = 215.9;
    }

    $('.print-button').html('');
    var anchorHTML = '<a title="Peecho Simple Print Button" href="http://www.peecho.com/" class="peecho-print-button" data-filetype="pdf" data-width="1024" data-height="768" data-pages="1" data-currency="USD" data-locale="en_EN" data-style="true">Peecho</a>'
    // var anchorTag = $('.print-button a');
    var anchorTag = $(anchorHTML);
    anchorTag.attr('data-width', width)
                .attr('data-height', height)
                .attr('data-filetype', filetype)
                .attr('data-pages', pages)
                .attr('data-src', src)
                .attr('data-title', getParameterByName('bookTitle') || "My Picturesque Book")
                .attr('data-thumbnail', image.src)
                .attr('data-style', true);

    $('.print-button').append(anchorTag);
    runPeechoScript();

    $('a.download-pdf').attr('href', pdfURL);
    $('a.download-pdf').text('Download PDF');
}

$(function () {
    if(!getParameterByName('local') && !getParameterByName('bookTitle') && !getParameterByName('bookUnique')) {
        window.location = 'itms://itunes.com/apps/picturesquephotobooksandcollagesdigitalandprint';
    }

    if (getParameterByName('local')) {
        // run in a webview on iOS
        $('a.download-pdf').text('PDF Uploading');
    } else {
        loadImages($('.carousel-inner'), 0);
    }

    $('.fb-comments').attr('data-href', window.location.href);

    FB.XFBML.parse();
});


/*** Third party ***/
function runPeechoScript() {
    (function() {
    var p=document.createElement("script");p.type="text/javascript";p.async=true;
    var h=("https:"==document.location.protocol?"https://":"http://");
    p.src=h+"d3aln0nj58oevo.cloudfront.net/button/script/13535386304271003.js";
    var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(p,s);
    }).call(this);
}


/*** Called only from Objective-C ***/

// called by Objective-C when an image is created
function addImageLocally(pageNumber, data) {
    var img = $(document.createElement('img')).attr('src', data).data(PAGE_NUMBER, pageNumber);
    loadPageIntoDiv(img, $('.carousel-inner'));
}

// called by Objective-C when the PDF is finished uploading
function pdfUploaded() {
    setPrintButton();
}