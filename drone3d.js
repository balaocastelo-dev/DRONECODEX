/* Real WebGL 3D drone inspired by Mini 3 silhouette; no official CAD or DJI endorsement. */
const mount=document.querySelector('#drone-webgl');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const load=async()=>{
  try{
    const THREE=await import('https://esm.sh/three@0.169.0');
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.6;
    mount.appendChild(renderer.domElement);
    const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(31,1,.1,80);camera.position.set(4,2.1,12);camera.lookAt(0,0,0);
    scene.add(new THREE.HemisphereLight(0xe3f4ff,0x253342,3));
    const key=new THREE.DirectionalLight(0xffebda,5);key.position.set(-5,7,8);scene.add(key);
    const edge=new THREE.DirectionalLight(0x83caff,4);edge.position.set(5,3,-5);scene.add(edge);
    const group=new THREE.Group();scene.add(group);
    const shell=new THREE.MeshPhysicalMaterial({color:0xbec8ce,metalness:.45,roughness:.32,clearcoat:.8});
    const light=new THREE.MeshPhysicalMaterial({color:0xe2e7e8,metalness:.2,roughness:.38,clearcoat:.7});
    const dark=new THREE.MeshStandardMaterial({color:0x252c32,metalness:.45,roughness:.34});
    const glass=new THREE.MeshPhysicalMaterial({color:0x050b13,metalness:.35,roughness:.08,clearcoat:1});
    const led=new THREE.MeshBasicMaterial({color:0x4dffb4});
    function add(geo,mat,x=0,y=0,z=0,parent=group){const obj=new THREE.Mesh(geo,mat);obj.position.set(x,y,z);parent.add(obj);return obj}
    const core=add(new THREE.BoxGeometry(1.35,.39,2.15),shell);core.rotation.x=-.045;
    add(new THREE.BoxGeometry(1.06,.08,1.4),light,0,.23,-.15);
    add(new THREE.BoxGeometry(.84,.22,.55),dark,0,-.07,-.88);
    const nose=add(new THREE.SphereGeometry(.57,24,16),shell,0,-.03,1.02);nose.scale.set(1,.43,.62);
    add(new THREE.BoxGeometry(.58,.16,.45),dark,0,-.31,1.27);
    const cam=add(new THREE.CylinderGeometry(.28,.28,.42,32),shell,0,-.38,1.49);cam.rotation.x=Math.PI/2;
    const lens=add(new THREE.CylinderGeometry(.19,.19,.45,32),glass,0,-.38,1.72);lens.rotation.x=Math.PI/2;
    const ring=add(new THREE.TorusGeometry(.205,.027,12,48),dark,0,-.38,1.95);
    const props=[];
    for(const side of [-1,1])for(const front of [-1,1]){
      const x=side*1.57,z=front*1.25;
      const arm=add(new THREE.BoxGeometry(1.42,.19,.24),shell,side*.89,.02,front*.75);
      arm.rotation.y=-side*front*.44;
      const elbow=add(new THREE.CylinderGeometry(.25,.25,.2,24),dark,x,.11,z);
      add(new THREE.CylinderGeometry(.22,.23,.18,24),shell,x,.23,z);
      add(new THREE.SphereGeometry(.065,12,8),led,x,.09,z+(front>0?.21:-.21));
      const rotor=new THREE.Group();rotor.position.set(x,.35,z);group.add(rotor);
      const bladeMat=new THREE.MeshPhysicalMaterial({color:0x7c8a94,metalness:.65,roughness:.3,transparent:true,opacity:.75,side:THREE.DoubleSide});
      for(let i=0;i<2;i++){const blade=new THREE.Mesh(new THREE.BoxGeometry(1.48,.022,.13),bladeMat);blade.rotation.y=i*Math.PI/2;rotor.add(blade)}props.push(rotor);
    }
    function resize(){const w=Math.max(1,mount.clientWidth),h=Math.max(1,mount.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
    new ResizeObserver(resize).observe(mount);resize();
    let progress=0,visible=true;addEventListener('drone-scroll',e=>progress=e.detail);document.addEventListener('visibilitychange',()=>visible=!document.hidden);
    function frame(time){requestAnimationFrame(frame);if(!visible)return;const t=time*.001;
      group.rotation.set(-.13+progress*.25, -.35+progress*1.9, -.1+progress*.15);
      group.position.set(Math.sin(progress*Math.PI)*-.65,(reduced?0:Math.sin(t*1.4)*.06)-progress*.4,0);
      group.scale.setScalar(1.05-progress*.25);
      if(!reduced)props.forEach((rotor,i)=>rotor.rotation.y=t*38*(i%2?1:-1));
      renderer.render(scene,camera)
    }requestAnimationFrame(frame);
    mount.dataset.webgl='ready';
  }catch(err){mount.classList.add('webgl-fallback');mount.setAttribute('title','Visualização 3D indisponível neste navegador');console.warn('WebGL fallback:',err)}
};
load();
