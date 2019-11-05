const fn_url_args = () => {
    var qs = location.search.substr(1),
        args = {},
        items = qs.length ? qs.split("&") : [],
        item = null,
        len = items.length;

    for(var i = 0; i < len; i++) {
        item = items[i].split("=");
        var name = decodeURIComponent(item[0]),
            value = decodeURIComponent(item[1]);
        if (name) {
            args[name] = value;
        }
    }
    return args;
};

export {
    fn_url_args
};
