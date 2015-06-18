/**
 * Hàm nhận vào một đường dẫn và cắt nó theo kí tự / và tùy biến nó thành một đường dẫn search
 * @param env
 */
module.exports = function (env) {
    env.addFilter('standard_route_search', function (route) {
            var st = route.split('/');
            if (st.length > 0) {
                return '/' + (st[1] == "search" ? st[2].substring(0, st[2].indexOf('?')) : st[1]);
            }
            else {
                return '';
            }
        }
    )
    ;
};