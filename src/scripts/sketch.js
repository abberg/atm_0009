(function(ab){
	"use strict";
	ab.sketch  = function(three){

		var scene = three.scene(),
			camera = three.camera(),
			renderer = three.renderer(),
			depthMaterial,
			depthTarget,
			composer,
			container,
			model,
			previousModel,

			init = function(){

				renderer.setClearColor( 0x333333 );

				setupPostprocessing();
				addLights();
				populateScene();

				camera.position.z = 50;

			},

			addLights = function(){
				
				var directionalLight = new THREE.DirectionalLight( 0xffffff ),
					bounceLight = new THREE.DirectionalLight( 0xbcc4b7, 0.7);
			
				scene.add(directionalLight);
				directionalLight.position.set( 1, 1, 1 );

				scene.add(bounceLight);
				bounceLight.position.set( -1, -1, -1 );

			},

			populateScene = function(){
				
				var geometry,
					material,
					mesh,
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
				//scene.add(mesh);

				container = new THREE.Object3D();
				model = new THREE.Object3D();
				previousModel = model.clone();
				scene.add( container );

				geometry = new THREE.SphereGeometry( 25, 28, 16 );
				material = new THREE.MeshBasicMaterial( { 
									color: 0x666666, 
									wireframe: true
								} );
				mesh = new THREE.Mesh(geometry, material);
				container.add(mesh);

				var numPoints = 10;
				var positions = distributedPointsOnSphere(numPoints, 25);
				console.log(positions);

				for(var i = 0; i < numPoints; i++){
					geometry = new THREE.BoxGeometry(1, 1, 0.1);
					material = new THREE.MeshBasicMaterial( { 
									color: 0x0000ff
								} );
					mesh = new THREE.Mesh(geometry, material);
					mesh.position.copy( positions[i] );
					mesh.lookAt(scene.position);
					container.add(mesh);
				}

				/*
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
				*/
			},

			randomPointOnSphere = function(radius){
				var x = Math.random() - 0.5, 
					y = Math.random() - 0.5, 
					z = Math.random() - 0.5,
    				k = Math.sqrt(x*x + y*y + z*z);
    			
    			while (k < 0.2 || k > 0.3){
					x = Math.random() - 0.5;
					y = Math.random() - 0.5;
					z = Math.random() - 0.5;
					k = Math.sqrt(x*x + y*y + z*z);
			    }
    			
    			return new THREE.Vector3(x/k, y/k, z/k).multiplyScalar(radius);
			},

			distributedPointsOnSphere = function(numPoints, radius){

				var points = [randomPointOnSphere(radius)],
					i,
					j,
					k,
					pl,
					best,
					point,
					distance,
					maxDistance,
					_last;

				for ( i = 1; i < numPoints; i++){
					
					best = undefined;
					
					for ( j = 0; j < 10; j++){
						
						point = randomPointOnSphere(radius);
						maxDistance = 0;

						for(k = 0, pl = points.length; k < pl; k++){
							
							distance = point.distanceTo(points[k]);
							
							if(!maxDistance || maxDistance > distance){
								maxDistance = distance;
							}
							
							if(!best || best[0] < maxDistance){
								best = [maxDistance, point];
							}

						}
					}

					points.push(best[1]);
				
				}

				return points;

			},

			setupPostprocessing = function(){
				// depth
				
				var depthShader = THREE.ShaderLib[ "depthRGBA" ];
				var depthUniforms = THREE.UniformsUtils.clone( depthShader.uniforms );

				depthMaterial = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms } );
				depthMaterial.blending = THREE.NoBlending;

				// postprocessing
				
				composer = new THREE.EffectComposer( renderer );
				composer.addPass( new THREE.RenderPass( scene, camera ) );

				depthTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat } );

				var ssao = new THREE.ShaderPass( THREE.SSAOShader );
				ssao.uniforms[ 'tDepth' ].value = depthTarget;
				ssao.uniforms[ 'size' ].value.set( window.innerWidth, window.innerHeight );
				ssao.uniforms[ 'cameraNear' ].value = camera.near;
				ssao.uniforms[ 'cameraFar' ].value = camera.far;
				ssao.uniforms[ 'aoClamp' ].value = 0.3;
				ssao.uniforms[ 'lumInfluence' ].value = 0.5;
				composer.addPass( ssao );
				ssao.renderToScreen = true;

			},
			
			update = function(timestep){
				var rotationVelocity = 0.0005;
				
				model.clone(previousModel);
				//model.rotation.x += rotationVelocity/2 * timestep;
				model.rotation.y += rotationVelocity * timestep;
				
			},
			
			draw = function(interpolation){
				THREE.Quaternion.slerp ( previousModel.quaternion, model.quaternion, container.quaternion, interpolation );
				/*
				scene.overrideMaterial = depthMaterial;
				renderer.render( scene, camera, depthTarget );

				scene.overrideMaterial = null;
				composer.render();
				*/

				renderer.render( scene, camera );
			}

		return{
			init: init,
			update: update,
			draw: draw
		}
	}

}(window.ab = window.ab || {}))