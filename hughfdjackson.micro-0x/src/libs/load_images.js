void function(root){


    function load_images(image_object, callback){
        
        var to_load = 0,
            images

        // logic
        if ( Object.prototype.toString.call(image_object) == '[object Array]' ) images = []
        else images = {}
        
        for ( var prop in image_object ){
            load(prop, image_object[prop])   
        }

        // helper methods (impure)
        function on_load(){
            to_load -= 1
            if ( to_load == 0 && callback ) callback(images)
        }
        
        function load(name, url){
            var image = new Image()
            to_load += 1
            image.src    = url
            image.onload = on_load
            images[name] = image
        }

    }

    if ( typeof module == 'object' && module.exports )
        module.exports = load_images
    else
        root.load_images = load_images


}(this)
