//负责代理，把上面的方法代理到context上面

let proto = {};

//老式的代理
//__defineGetter__
//__defineSetter__
function delegateGet(property, name) {
    proto.__defineGetter__(name, function(val) {
        return this[property][name];
    })
}

function delegateSet(property, name) {
    proto.__defineSetter__(name, function(val) {
        this[property][name] = val
    })
}
let requeSet = [];
let requeGet = ["query"];
let responseSet = ["body", "status"];
let responseGet = responseSet;
requeSet.forEach(ele => {
    delegateSet("request", ele)
})
requeGet.forEach(ele => {
    delegateGet("request", ele)
})
responseSet.forEach(ele => {
    delegateSet("response", ele)
})
responseGet.forEach(ele => {
    delegateGet("response", ele)
})
module.exports = proto;