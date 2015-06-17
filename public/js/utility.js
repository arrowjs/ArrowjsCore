/**
 * Created by thanhnv on 5/19/15.
 */
"use strict"
var upload_url = 'http://103.27.238.52:3002/';
var createCORSRequest = function (method, url) {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    if ("withCredentials" in xhr) {

        // Check if the XMLHttpRequest object has a "withCredentials" property.
        // "withCredentials" only exists on XMLHTTPRequest2 objects.
        xhr.open(method, url, true);

    } else if (typeof XDomainRequest != "undefined") {

        // Otherwise, check if XDomainRequest.
        // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
        xhr = new XDomainRequest();
        xhr.open(method, url);

    } else {

        // Otherwise, CORS is not supported by the browser.
        xhr = null;

    }
    return xhr;
};

function showLoading(element) {
    if (!element) {
        element = "#course-content";
    }
    $(element).append('<div class="overlay"><i class="fa fa-refresh fa-spin"></i></div>');
}
function hideLoading() {
    $(".overlay").remove();
}
