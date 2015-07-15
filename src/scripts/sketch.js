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

				camera.position.z = 70;

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
					numPoints,
					positions,
					i;

				geometry = new THREE.SphereGeometry( 75 );
				material = new THREE.MeshPhongMaterial( { 
									color: 0xffffed, 
									side:THREE.BackSide, 
									wrapAround:true,
									wrapRGB: new THREE.Vector3(1, 1, 1)
								} );
				mesh = new THREE.Mesh(geometry, material);
				scene.add(mesh);

				geometry = new THREE.SphereGeometry( 8 , 16, 8);
				material = new THREE.MeshBasicMaterial( { 
									color: 0x000000
								} );
				mesh = new THREE.Mesh(geometry, material);
				scene.add(mesh);

				container = new THREE.Object3D();
				model = new THREE.Object3D();
				previousModel = model.clone();
				scene.add( container );

				numPoints = 180;
				positions = distributedPointsOnSphere(numPoints, 8);

				for(i = 0; i < numPoints; i++){
					
					mesh = createRandomBuilding();
					mesh.position.copy( positions[i] );
					mesh.lookAt(scene.position);
					container.add(mesh);

				}

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

						}

						if(!best || best[0] < maxDistance){
							best = [maxDistance, point];
						}
					}

					points.push(best[1]);
				
				}

				return points;

			},

			createRandomBuilding = function(){
				var geometry,
					material,
					mesh,
					width,
					depth,
					height,
					towerHeight,
					i,
					mat4 = new THREE.Matrix4(),
					zpos = new THREE.Vector3(),
					box = new THREE.Box3(),
					pickRandomColor = function(){
						var pick = Math.floor( Math.random() * 5 ),
							palette = [0xa28f65, 0x7d673e, 0x655b38, 0x473b11, 0x171200];
						return palette[pick];
					};

				var type = Math.floor( Math.random() * 4 ) + 1;
				
				switch(type){
					case 1:
						// basic tower
						width =  1 + Math.random()*4;
						depth = 1 + Math.random()*4;
						height = 10 + Math.random() * 20;

						geometry = new THREE.BoxGeometry( width, depth, height );
						geometry.applyMatrix( mat4.setPosition( zpos.set(0, 0, -height/2) ) );

						material = new THREE.MeshLambertMaterial({color:pickRandomColor()});
						mesh = new THREE.Mesh(geometry, material);
						container.add(mesh);
						break;
						
					case 2:
						// alternate small and large
						width =  1 + Math.random()*4;
						depth = 1 + Math.random()*4;
						height = 2 + Math.random();
						towerHeight = 7 + Math.floor( Math.random() * 12 / 2 ) * 2;
						for(i = 0; i < towerHeight; i++){
							if(i%2){
								
								geometry.merge( new THREE.BoxGeometry( width, depth, height ),  mat4.setPosition( zpos.set(0, 0, geometry.boundingBox.min.z - height/2) ) )
									
							}else{
								if(!geometry){
									geometry = new THREE.BoxGeometry( width * 0.75, depth*0.75, height*0.1 );
									geometry.applyMatrix( mat4.setPosition( zpos.set(0, 0, (-height*0.1)/2 ) ) );
								}else{
									geometry.merge( new THREE.BoxGeometry( width * 0.75, depth*0.75, height*0.1 ),  mat4.setPosition( zpos.set(0, 0, geometry.boundingBox.min.z - ( ( height * 0.1 ) / 2) ) ) );
								}
							}
							
							geometry.computeFaceNormals();
							//geometry.computeVertexNormals();

							material = new THREE.MeshLambertMaterial({color:pickRandomColor()});
							mesh = new THREE.Mesh(geometry, material);
							geometry.computeBoundingBox();
							
						}
						break;
					case 3:
						// offset stack
						width = depth = 3 + Math.random()*2;
						height = 2 + Math.random() * 2;
						towerHeight = 5 + ( Math.floor( Math.random() * 3 ) + 1 );
						for(i = 0; i < towerHeight; i++){
							
							if(!geometry){
								geometry = new THREE.BoxGeometry( width, depth, height );
								geometry.applyMatrix( mat4.setPosition( zpos.set(0, 0, - ( height / 2 ) ) ) );
							}else{
								geometry.merge( new THREE.BoxGeometry( width, depth, height ),  mat4.setPosition( zpos.set(Math.random() * ( width / 2 ) - ( width / 4 ), Math.random() * ( width / 2 ) - ( width / 4 ), geometry.boundingBox.min.z - ( height / 2) ) ) );
							}
						
							geometry.computeFaceNormals();
							//geometry.computeVertexNormals();

							material = new THREE.MeshLambertMaterial({color:pickRandomColor()});
							mesh = new THREE.Mesh(geometry, material);
							geometry.computeBoundingBox();
							
						}
						break;
					case 4:
						// narrowing stack
						width = depth = 1 + Math.random()*2;
						height = 15;
						towerHeight = 3;
						for(i = 0; i < towerHeight; i++){
							
							if(!geometry){
								geometry = new THREE.BoxGeometry( width, depth, height );
								geometry.applyMatrix( mat4.setPosition( zpos.set(0, 0, -( height / 2 ) ) ) );
							}else{
								geometry.merge( new THREE.BoxGeometry( width * ( 0.75 / i ), depth * ( 0.75 / i ), height * ( 0.3 / i ) ),  mat4.setPosition( zpos.set(0, 0, geometry.boundingBox.min.z - ( ( height * ( 0.3 / i ) ) / 2) ) ) );
							}
						
							geometry.computeFaceNormals();

							material = new THREE.MeshLambertMaterial({color:pickRandomColor()});
							mesh = new THREE.Mesh(geometry, material);
							geometry.computeBoundingBox();
							
						}
						break;
				}

				return mesh;
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
				ssao.uniforms[ 'aoClamp' ].value = 0.4;
				ssao.uniforms[ 'lumInfluence' ].value = 0.6;
				//ssao.uniforms[ 'onlyAO' ].value = true;
				composer.addPass( ssao );
				ssao.renderToScreen = true;

			},
			
			update = function(timestep){
				var rotationVelocity = 0.0005;
				
				model.clone(previousModel);
				model.rotation.x += rotationVelocity/2 * timestep;
				model.rotation.y += rotationVelocity * timestep;
				
			},
			
			draw = function(interpolation){
				THREE.Quaternion.slerp ( previousModel.quaternion, model.quaternion, container.quaternion, interpolation );
				
				scene.overrideMaterial = depthMaterial;
				renderer.render( scene, camera, depthTarget );

				scene.overrideMaterial = null;
				composer.render();
				
			}

		return{
			init: init,
			update: update,
			draw: draw
		}
	}

}(window.ab = window.ab || {}))