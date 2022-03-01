module.exports = (errors = []) => {
    let result = {};
    var prevParam = "";
    errors.map(err => {
        if(prevParam !== err.param){
            result[err.param] = {
                message  : err.msg,
                oldValue : err.value
            }
        }
        prevParam = err.param;
    });
    return result;
}