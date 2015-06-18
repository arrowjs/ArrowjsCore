/**
 * Hàm này nhận vào một giá trị tiền tệ theo kiểu vnd sẽ được chuyển đổi
 * từ một chuổi số thành kiểu tiền tệ có ngăn cách các thành phần chục trăm, ngàn để trả lại
 * @param env
 */


module.exports = function (env) {
    env.addFilter('vnd', function (value) {
        if (value < 1) {
            return "Miễn Phí";
        }
        var c = 0,
            d = ',',
            t = '.';
        var n = value,
            c = isNaN(c = Math.abs(c)) ? 2 : c,
            d = d == undefined ? "." : d,
            t = t == undefined ? "," : t,
            s = n < 0 ? "-" : "",
            i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
            j;
        j = (j = i.length) > 3 ? j % 3 : 0;
        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    });
};