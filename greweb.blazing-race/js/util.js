(function(ns){
ns.util = {
  makeEvent: function (_){return {
    pub:function (a,b,c,d){for(d=-1,c=[].concat(_[a]);c[++d];)c[d](b)},
    sub:function (a,b){(_[a]||(_[a]=[])).push(b)},
    del:function (a,b){if(_[a]){var i = $.indexOf(_[a], b);i>=0 && _[a].splice(i, 1);}}
  }}
}
}(window.BlazingRace=window.BlazingRace||{}));
