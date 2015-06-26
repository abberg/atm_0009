(function(ab){
	"use strict";
	ab.sketch  = function(three){

		var scene = three.scene(),
			camera = three.camera(),
			renderer = three.renderer(),
			container,
			model,
			previousModel,

			init = function(){
				var geometry,
					material,
					mesh,
					directionalLight = new THREE.DirectionalLight( 0xffffff ),
					bounceLight = new THREE.DirectionalLight( 0xbcc4b7, 0.7),
					pickRandomColor = function(){
						var num = Math.floor( Math.random() * 50 );

						return new THREE.Color('rgb('+(68+num)+', '+(55+num)+', '+(20+num)+')');
					}

				geometry = new THREE.SphereGeometry( 50 );
				material = new THREE.MeshPhongMaterial( { 
									color: 0xffffed, 
									side:THREE.BackSide, 
									wrapAround:true,
									wrapRGB: new THREE.Vector3(1, 1, 1)
								} );
				mesh = new THREE.Mesh(geometry, material);
				scene.add(mesh);

				container = new THREE.Object3D();
				model = new THREE.Object3D();
				previousModel = model.clone();
				scene.add( container );

				geometry = new THREE.BoxGeometry( 1, 1, 1 );

				for(var i = 0; i < 800; i++){
					material = new THREE.MeshLambertMaterial({color:pickRandomColor()});
					mesh = new THREE.Mesh(geometry, material);
					mesh.scale.z = 35 + Math.random() * 15;
					mesh.scale.x = mesh.scale.y = 0.2 + Math.random()*3
					mesh.rotation.x = Math.random() * Math.PI;
					mesh.rotation.y = Math.random() * Math.PI;
					container.add(mesh);
				}

				scene.add(directionalLight);
				directionalLight.position.set( 1, 1, 1 );

				scene.add(bounceLight);
				bounceLight.position.set( -1, -1, -1 );

				renderer.setClearColor( 0x333333 );

				camera.position.z = 50;
			},
			
			update = function(timestep){
				var rotationVelocity = 0.0005;
				
				model.clone(previousModel);
				model.rotation.x += rotationVelocity/2 * timestep;
				model.rotation.y += rotationVelocity * timestep;
				
			},
			
			draw = function(interpolation){
				THREE.Quaternion.slerp ( previousModel.quaternion, model.quaternion, container.quaternion, interpolation );
				renderer.render(scene, camera);
			}

		return{
			init: init,
			update: update,
			draw: draw
		}
	}

}(window.ab = window.ab || {}))