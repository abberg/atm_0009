(function(){

	"use strict";
	
	var loop = ab.gameLoop(),
		three = ab.threeBase({
			preserveDrawingBuffer : ab.controlBar ? true : false
		}),
		sketch = ab.sketch(three);

	loop.addEventListener('frameupdate', function(event){

		var timestep = event.detail.timestep;
		sketch.update(timestep);
	
	})

	loop.addEventListener('framedraw', function(event){

		var interpolation = event.detail.interpolation;
		sketch.draw(interpolation);

	});

	sketch.init();
	loop.start();

	if(ab.controlBar){
		ab.controlBar(loop, three.renderer().domElement);
	}

}())