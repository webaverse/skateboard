import * as THREE from 'three';

import metaversefile from 'metaversefile';

const { useApp, useFrame, useInternals, useLocalPlayer, useLoaders, usePhysics, useCleanup, useActivate } = metaversefile;
const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localVector3 = new THREE.Vector3();
const localVector4 = new THREE.Vector3();
const localVector5 = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();
const localQuaternion2 = new THREE.Quaternion();
const localQuaternion3 = new THREE.Quaternion();
const localQuaternion4 = new THREE.Quaternion();


export default () => {
  const app = useApp();
  const { renderer, camera } = useInternals();
  const localPlayer = useLocalPlayer();
  const physics = usePhysics();
  const textureLoader = new THREE.TextureLoader();


  /*app.addEventListener('wearupdate', e => {
    if (e.wear) {
      if (app.glb) {

        sitSpec = app.getComponent('sit');
        if (sitSpec) {
          const {instanceId} = app;
          const localPlayer = useLocalPlayer();

          const rideBone = sitSpec.sitBone ? sitSpec.sitBone : null;
          const sitAction = {
            type: 'sit',
            time: 0,
            animation: sitSpec.subtype,
            controllingId: instanceId,
            controllingBone: rideBone,
          };
          localPlayer.setControlAction(sitAction);
        }
      }
    } else {
      //_unwear();
    }
  });*/
  
  //####################################################### load skateboard glb ####################################################
  {    
    let skateboard;
    let velocity = new THREE.Vector3();
    let angularVel = new THREE.Vector3();
    let physicsIds = [];
    let activateCb = null;
    let sitSpec = null;
    let isSticky = true;
    let sitPos = null;
    let vehicle = null;
    let rayArray = [];
    let debugRays = [];
    let pointArray = [];
    const maxSpeed = 200;
    let elapsedTime = 0;
    (async () => {
        const u = `${baseUrl}/skateboard/assets/skateboard.glb`;
        skateboard = await new Promise((accept, reject) => {
            const {gltfLoader} = useLoaders();
            gltfLoader.load(u, accept, function onprogress() {}, reject);
            
        });
        app.add(skateboard.scene);

        const physicsId = physics.addBoxGeometry(
          new THREE.Vector3(0, 2, 0),
          new THREE.Quaternion(),
          new THREE.Vector3(0.25, 0.05, 0.5),
          true
        );
        physicsIds.push(physicsId);

        vehicle = app.physicsObjects[0];

        //physics.setMassAndInertia(vehicle, 10000, 1000);

        //const physicsId = physics.addGeometry(skateboard.scene);
        //physicsIds.push(physicsId);

        /*sitPos = new THREE.Object3D;
        sitPos.position.copy(app.position);
        app.add(sitPos);*/

        physics.setGravityEnabled(vehicle, false);
        //physics.setMassAndInertia(vehicle, 0.8, new THREE.Vector3(0,10000000000,0));


    
        

        skateboard.scene.traverse(o => {
          o.castShadow = true;
          console.log(o);
          if(o.name === "sitPos") {
            sitPos = o;
            console.log(o, "we have a sitPos");
          }
          if(o.name === "frontL") {
            rayArray[0] = o;

          }
          if(o.name === "frontR") {
            rayArray[1] = o;
            
          }
          if(o.name === "backL") {
            rayArray[2] = o;
            
          }
          if(o.name === "backR") {
            rayArray[3] = o;
          }
        });


        debugRays[0] = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), rayArray[0].position, 2, 0xff0000);
        debugRays[1] = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), rayArray[1].position, 2, 0xff0000);
        debugRays[2] = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), rayArray[2].position, 2, 0xff0000);
        debugRays[3] = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), rayArray[3].position, 2, 0xff0000);

        for (var i = 0; i < debugRays.length; i++) {
          app.add(debugRays[i]);
        }



        app.updateMatrixWorld();
    })();
    activateCb = () => {
        if (
          app.getComponent('wear') ||
          app.getComponent('pet') ||
          app.getComponent('sit')
        ) {
          app.wear();
          sitSpec = app.getComponent('sit');
          const {instanceId} = app;
          const sitAction = {
            type: 'sit',
            time: 0,
            animation: sitSpec.subtype,
            controllingId: instanceId,
            controllingBone: sitPos,
          };
          localPlayer.setControlAction(sitAction);
        }
    };
    useCleanup(() => {
      for (const physicsId of physicsIds) {
        physics.removeGeometry(physicsId);
      }
    });
    useActivate(() => {
      activateCb && activateCb();
    });

    //let clock = new THREE.Clock();
    useFrame(({ timeDiff, timestamp }) => {

      //elapsedTime = timestamp;
      //console.log(clock);

      //console.log(timeDiff);

      //sitPos.position.y = app.position.y;
      //var target = new THREE.Vector3(); // create once an reuse it
      //var targetObj = new THREE.Object3D;

      //app.getWorldPosition( sitPos );
      //console.log(target);

      //sitPos.position.y = app.position.y + 1;


      const downQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI*0.5);
      const forwardVec = new THREE.Vector3( 0, 0, 1 );
      const backwardVec = new THREE.Vector3( 0, 0,-1 );
      forwardVec.applyQuaternion(app.quaternion);
      backwardVec.applyQuaternion(app.quaternion);

      if(vehicle && app) {

        app.position.copy(vehicle.position);
        app.quaternion.copy(vehicle.quaternion);
        app.updateMatrixWorld();

      }
      //app.updateMatrixWorld();
      
      if (localPlayer.avatar && sitSpec) { 

        //physics.enableActor(physicsIds[0]);

          physics.setGravityEnabled(vehicle, true);
          //physics.setVelocity(vehicle, new THREE.Vector3(velocity.x/10, -0.07, velocity.z/10), true);
          //physics.setAngularVelocity(vehicle, angularVel, true);
          let a = 0.00001;
          //physics.addTorque(vehicle, new THREE.Vector3(0, a, 0), true)

        //physics.setTransform(physicsIds[0]);
        //physics.disableGeometryQueries(physicsIds[0])

        
        //console.log(physicsIds[0].position);
        //physics.enableGeometry(physicsIds[0]);
        //app.updateMatrixWorld();
        
        let tempQuat = new THREE.Quaternion();
        //localPlayer.avatar.app.visible = false;
        //localPlayer.avatar.app.position.set(target.x + 3, target.y, target.z);

        if(velocity.length() < maxSpeed) {
          velocity.add(localVector.copy(localPlayer.characterPhysics.keysDirection));
        }
        
        //app.position.add(localVector2.copy(velocity).multiplyScalar(16.6/10000));
        //app.position.add(localVector2.copy(velocity).multiplyScalar(15000/20000000));
        
        const resultDown = physics.raycast(app.position, downQuat);
        const resultForward = physics.raycast(app.position, app.quaternion);

        
        /*let vecPos = new THREE.Vector3();
        let vecPos2 = new THREE.Vector3();

        rayArray[0].localToWorld(vecPos);
        rayArray[3].localToWorld(vecPos2);*/
        let target = new THREE.Vector3();
        let target2 = new THREE.Vector3();
        let target3 = new THREE.Vector3();
        let target4 = new THREE.Vector3();
        rayArray[0].getWorldPosition( target );
        rayArray[1].getWorldPosition( target2 );
        rayArray[2].getWorldPosition( target3 );
        rayArray[3].getWorldPosition( target4 );


        pointArray[0] = physics.raycast(target, downQuat);
        pointArray[1] = physics.raycast(target2, downQuat);
        pointArray[2] = physics.raycast(target3, downQuat);
        pointArray[3] = physics.raycast(target4, downQuat);

        //console.log(rayArray);

       //app.add(new THREE.ArrowHelper(new THREE.Vector3().fromArray(rayBackR.point), vecPos2, 300, 0xff0000) );
        //app.add(new THREE.ArrowHelper(new THREE.Vector3().fromArray(rayFrontR.point), rayArray[1].position, 300, 0xff0000) );
        //app.add(new THREE.ArrowHelper(new THREE.Vector3().fromArray(rayBackL.point), rayArray[2].position, 300, 0xff0000) );
        //app.add(new THREE.ArrowHelper(new THREE.Vector3().fromArray(rayBackR.point), rayArray[3].position, 300, 0xff0000) );

        /*const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
        const points = [];
        points.push( rayArray[0].position );
        points.push( new THREE.Vector3(rayFrontL.point[0], rayFrontL.point[1], rayFrontL.point[2]));

        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        const line = new THREE.Line( geometry, material );

        app.add(line);*/

        physics.addForce(vehicle, new THREE.Vector3(0,0,velocity.z/10).multiplyScalar(0.97));
        velocity.z = 0;
        physics.addTorque(vehicle, new THREE.Vector3(0, 0, 0).multiplyScalar(0.97));

        for (var i = 0; i < rayArray.length; i++) {
          //velocity.add(new THREE.Vector3().fromArray(pointArray[i].point));

          var dir = new THREE.Vector3(); // create once an reuse it
          let v1 = rayArray[i].position.clone();
          let targetss = new THREE.Vector3();
          rayArray[i].getWorldPosition(targetss);
          let v2 = new THREE.Vector3().fromArray(pointArray[i].point);
          dir.subVectors(targetss, v2);

          //console.log(rayArray[i].up);

          if(pointArray[i]) {
            //velocity.add(dir);
            let force = 0;
            force = Math.abs(1 / (pointArray[i].point[1] - targetss.y))
            console.log(force);
            physics.addForceAtPos(vehicle, new THREE.Vector3(0,force/4,0), targetss);
          }
          else {
            //velocity.sub(dir);
          }

          /*tempQuat
            .setFromUnitVectors(
              localVector.set(0, 0, -1),
              localVector2.set(velocity.x, 0, velocity.z).normalize()
            )
            .premultiply(localQuaternion2.setFromAxisAngle(axis, radians));*/
        }

        for (var i = 0; i < debugRays.length; i++) {
          let newDir = new THREE.Vector3().fromArray(pointArray[i].point);
          let absDir = new THREE.Vector3();
          let targetss = new THREE.Vector3();
          rayArray[i].getWorldPosition(targetss);
          absDir.subVectors(newDir, targetss).normalize();
          debugRays[i].setDirection(absDir);
          debugRays[i].setLength(pointArray[i].distance);
        }



        //console.log(rayFrontL, rayFrontR, rayBackR, rayBackL);
        
        /*if(resultForward) {
          let normalVec = localVector.fromArray(resultForward.normal);
          let up = new THREE.Vector3(0,0,1);
          let axis = new THREE.Vector3().crossVectors(up.clone(), normalVec.clone()).normalize();
          let radians = Math.acos(localVector.clone(normalVec).dot(up));

          let normalVecForward = localVector.fromArray(resultForward.normal);
          if(resultForward.distance < 1) {
            if(normalVecForward.x === 1 || normalVecForward.x === -1 || normalVecForward.z === 1 || normalVecForward.z === -1 ) {
              velocity.set(0,0,0);
            }
            else if(Math.abs(normalVecForward.x) > 0.4 || Math.abs(normalVecForward.z) > 0.4 || Math.abs(normalVecForward.y) > 0.4) {
              velocity.add(new THREE.Vector3(0,Math.abs(velocity.length())/10,0));

              tempQuat
              .setFromUnitVectors(
                localVector.set(0, 0, 1),
                localVector2.set(0, -velocity.y, velocity.z).normalize()
              )
              .premultiply(localQuaternion2.setFromAxisAngle(axis, radians));
              app.quaternion.slerp(tempQuat, 0.05);
              }
          }
        }*/

        if(resultDown) {

          let normalVec = localVector.fromArray(resultDown.normal);
          let up = new THREE.Vector3(0,1,0);
          let axis = new THREE.Vector3().crossVectors(up.clone(), normalVec.clone()).normalize();
          let radians = Math.acos(localVector.clone(normalVec).dot(up));

          normalVec.y !== 1 && velocity.length() >= 0 ? isSticky = false : isSticky = true;

          /*tempQuat
            .setFromUnitVectors(
              localVector.set(0, 0, -1),
              localVector2.set(velocity.x, 0, velocity.z).normalize()
            )
            .premultiply(localQuaternion2.setFromAxisAngle(axis, radians));*/

            //app.position.y = resultDown.point[1] + 0.5;
            //app.position.y += Math.sin(0.1 + timestamp/350) * 0.05; // Floating effect
            //app.quaternion.slerp(tempQuat, 0.1);
            //app.quaternion.copy(tempQuat);
        }
        /*else {
          tempQuat
            .setFromUnitVectors(
              localVector.set(0, 0, -1),
              localVector2.set(velocity.x, 0, velocity.z).normalize()
            );
            //app.quaternion.slerp(tempQuat, Math.sin(0.5 + 15000/20000000) * 0.05);
            app.quaternion.copy(tempQuat);

            //localVector.copy(new THREE.Vector3(0,-20.8,0))
             // .multiplyScalar(15000/55000);

            //velocity.add(localVector);
            velocity.set(velocity.x,0,velocity.z);
            app.position.add(new THREE.Vector3(0,0.1,0));
        }*/

        velocity.x *= 0.1;
        velocity.y *= 0.1;
        velocity.z *= 0.1;
        //app.updateMatrixWorld();

        
      }

    });
  }

  app.setComponent(
      "sit",
      {
        "subtype": "stand",
        "sitOffset": [0, 0, 0]
      }
  );

  return app;
};

// import * as THREE from 'three';

// import metaversefile from 'metaversefile';

// const { useApp, useFrame, useInternals, useLocalPlayer, useLoaders, usePhysics, useCleanup, useActivate } = metaversefile;
// const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

// const localVector = new THREE.Vector3();
// const localVector2 = new THREE.Vector3();
// const localVector3 = new THREE.Vector3();
// const localQuaternion = new THREE.Quaternion();
// const localQuaternion2 = new THREE.Quaternion();


// export default () => {
//   const app = useApp();
//   const { renderer, camera } = useInternals();
//   const localPlayer = useLocalPlayer();
//   const physics = usePhysics();
//   const textureLoader = new THREE.TextureLoader();


//   /*app.addEventListener('wearupdate', e => {
//     if (e.wear) {
//       if (app.glb) {

//         sitSpec = app.getComponent('sit');
//         if (sitSpec) {
//           const {instanceId} = app;
//           const localPlayer = useLocalPlayer();

//           const rideBone = sitSpec.sitBone ? sitSpec.sitBone : null;
//           const sitAction = {
//             type: 'sit',
//             time: 0,
//             animation: sitSpec.subtype,
//             controllingId: instanceId,
//             controllingBone: rideBone,
//           };
//           localPlayer.setControlAction(sitAction);
//         }
//       }
//     } else {
//       //_unwear();
//     }
//   });*/
  
//   //####################################################### load skateboard glb ####################################################
//   {    
//     let skateboard;
//     let velocity = new THREE.Vector3();
//     let physicsIds = [];
//     let activateCb = null;
//     let sitSpec = null;
//     (async () => {
//         const u = `${baseUrl}/skateboard/assets/skateboard.glb`;
//         skateboard = await new Promise((accept, reject) => {
//             const {gltfLoader} = useLoaders();
//             gltfLoader.load(u, accept, function onprogress() {}, reject);
            
//         });
//         skateboard.scene.position.y=0.5;
//         const physicsId = physics.addGeometry(skateboard.scene);
//         physicsIds.push(physicsId);
    
//         app.add(skateboard.scene);

//         skateboard.scene.traverse(o => {
//           o.castShadow = true;
//         });

//         app.updateMatrixWorld();
//     })();
//     activateCb = () => {
//         if (
//           app.getComponent('wear') ||
//           app.getComponent('pet') ||
//           app.getComponent('sit')
//         ) {
//           app.wear();
//           sitSpec = app.getComponent('sit');
//           const {instanceId} = app;
//           const sitAction = {
//             type: 'sit',
//             time: 0,
//             animation: sitSpec.subtype,
//             controllingId: instanceId,
//             controllingBone: null,
//           };
//           localPlayer.setControlAction(sitAction);
//         }
//     };
//     useCleanup(() => {
//       for (const physicsId of physicsIds) {
//         physics.removeGeometry(physicsId);
//       }
//     });
//     useActivate(() => {
//       activateCb && activateCb();
//     });
//     useFrame(({ timestamp }) => {

//       const quaternion = new THREE.Quaternion();
//       quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI*0.5);

//       const result = physics.raycast(app.position, quaternion);
//       if (result && sitSpec) {
//         skateboard.scene.position.y=0;
//         let normalVec = localVector.fromArray(result.normal).normalize();

        
//         //app.position.y += Math.sin(0.1 + timestamp/350) * 0.05; // Floating effect

//         let newVector = new THREE.Vector3();

//         let axis = new THREE.Vector3(0,0,1);
//         let up = new THREE.Vector3(0,1,0);
//         let radians = Math.acos(normalVec.dot(up));
//         let quat = new THREE.Quaternion().setFromAxisAngle(axis, radians);
//         newVector.applyQuaternion(quat);

//         if(localPlayer.avatar) {
//           //console.log(timestamp);
//           //localPlayer.avatar.visible = false;
//           //localPlayer.avatar.app.visible = false;
//           velocity.add(localVector.copy(localPlayer.characterPhysics.keysDirection));
//           //app.position.set(localPlayer.position.x, app.position.y, localPlayer.position.z);
//           app.position.add(localVector2.copy(velocity).multiplyScalar(15000/20000000));
//           let tempQuat = new THREE.Quaternion();

//           tempQuat
//             .setFromUnitVectors(
//               localVector.set(0, 0, -1),
//               localVector2.set(velocity.x, 0, velocity.z).normalize()
//             )
//             .premultiply(localQuaternion2.setFromAxisAngle(axis, radians));

            


//           if(result.distance < 0.2) {
//             tempQuat
//             .setFromUnitVectors(
//               localVector.set(0, 0, -1),
//               localVector2.set(velocity.x, 0, velocity.z).normalize()
//             )
//             .premultiply(localQuaternion2.setFromAxisAngle(axis, radians));
//             app.position.y = result.point[1] + 0.15;
//             app.quaternion.slerp(tempQuat, 0.1);
            
//           }
//           else {
//             tempQuat
//             .setFromUnitVectors(
//               localVector.set(0, 0, -1),
//               localVector2.set(velocity.x, velocity.y, velocity.z).normalize()
//             );
//             app.quaternion.slerp(tempQuat, Math.sin(0.5 + 15000/20000000) * 0.05);
//             localVector.copy(new THREE.Vector3(0,-20.8,0))
//               .multiplyScalar(15000/550000);

//             //localVector.y -= Math.sin(0.25 + timestamp/350) * 0.05;
//             velocity.add(localVector);

//             //app.position.y -= 0.05;
//           }
//         }

//         //app.quaternion.setFromUnitVectors(app.position, newVector);

//         //app.quaternion ;

//         velocity.x *= 0.995;
//         velocity.y *= 0.995;
//         velocity.z *= 0.995;

//         if(app.position.y < -10) {
//           //app.position.y = localPlayer.position.y + 0.1;
//         }

//         app.updateMatrixWorld();
//       }

//     });
//   }
  
//   //app.setComponent('renderPriority', 'low');
//   app.setComponent(
//       "sit",
//       {
//         "subtype": "",
//         "sitOffset": [0, 0, 0]
//       }
//   );
//   console.log(app)

//   return app;
// };