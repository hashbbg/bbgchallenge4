function imgData(img){ 
    var canvas = document.createElement('canvas')
      , context = canvas.getContext('2d')

    canvas.width = img.width
    canvas.height = img.height

    context.drawImage(img, 0, 0)
    return context.getImageData(0, 0, img.width, img.height)
}

function getColor(data, x, y, color){
    var pos = ['red', 'green', 'blue', 'alpha'].indexOf(color)
    return data.data[((y*(data.width*4)) + (x*4)) + pos]
}

var collmap = function(img){
    var data = imgData(img)

    return {
        data: data
      , image: img
        // true for any non-0, false for 0 
      , test: function(x, y, color){
            return !!getColor(this.data, ~~x, ~~y, color)
        }
    }
}


module.exports = collmap
