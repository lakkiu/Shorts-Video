// Post chain: colour+depth pass, normal/flag pass, ink outlines (depth + normal edges, world only),
// lens blur by depth, grade + vignette. All pixel sizes scale with output height / 1920.
import * as THREE from "../lib/three.module.min.js";

const quadVS = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }";

export function makePost(renderer, W, H) {
  const rtColor = new THREE.WebGLRenderTarget(W, H, { samples: 0 });
  rtColor.texture.colorSpace = THREE.LinearSRGBColorSpace;
  rtColor.depthTexture = new THREE.DepthTexture(W, H);
  rtColor.depthTexture.type = THREE.UnsignedIntType;
  const rtNormal = new THREE.WebGLRenderTarget(W, H);
  const rtInk = new THREE.WebGLRenderTarget(W, H);

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
  const qScene = new THREE.Scene();
  qScene.add(quad);
  const qCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const px = H / 1920;

  const common = `
    uniform sampler2D tDepth; uniform float near; uniform float far; uniform vec2 res;
    float viewZ(vec2 uv){ float d = texture2D(tDepth, uv).x; return (near*far)/((far-near)*d - far) * -1.0; }
  `;

  const inkMat = new THREE.ShaderMaterial({
    uniforms: {
      tColor: { value: rtColor.texture }, tDepth: { value: rtColor.depthTexture }, tNormal: { value: rtNormal.texture },
      near: { value: 0.1 }, far: { value: 1000 }, res: { value: new THREE.Vector2(W, H) },
      ink: { value: new THREE.Color("#141626") }, px: { value: px },
    },
    vertexShader: quadVS,
    fragmentShader: `
      uniform sampler2D tColor; uniform sampler2D tNormal; uniform vec3 ink; uniform float px;
      ${common}
      varying vec2 vUv;
      void main(){
        vec4 col = texture2D(tColor, vUv);
        vec4 nC = texture2D(tNormal, vUv);
        float zC = viewZ(vUv);
        float w = mix(4.6, 2.2, smoothstep(5.0, 70.0, zC)) * px;
        float edge = 0.0;
        if (nC.a > 0.5) {
          vec2 o[8];
          o[0]=vec2(1,0); o[1]=vec2(-1,0); o[2]=vec2(0,1); o[3]=vec2(0,-1);
          o[4]=vec2(.7,.7); o[5]=vec2(-.7,.7); o[6]=vec2(.7,-.7); o[7]=vec2(-.7,-.7);
          for (int i=0;i<8;i++){
            vec2 uv = vUv + o[i]*w/res;
            vec4 nN = texture2D(tNormal, uv);
            if (nN.a < 0.5) continue;            // never ink against a character card
            float zN = viewZ(uv);
            float dz = (zN - zC) / zC;           // only the nearer side draws the line
            if (dz > 0.035) edge = 1.0;
            vec3 a = nC.rgb*2.-1., b = nN.rgb*2.-1.;
            if (dot(a,b) < 0.8) edge = max(edge, 0.9);
          }
        }
        float fade = 1.0 - 0.75*smoothstep(45.0, 160.0, zC);
        gl_FragColor = vec4(mix(col.rgb, ink, edge*fade), 1.0);
      }`,
  });

  const finalMat = new THREE.ShaderMaterial({
    uniforms: {
      tInk: { value: rtInk.texture }, tDepth: { value: rtColor.depthTexture },
      near: { value: 0.1 }, far: { value: 1000 }, res: { value: new THREE.Vector2(W, H) },
      focus: { value: 6 }, blur: { value: 7 * px }, sat: { value: 1.08 },
    },
    vertexShader: quadVS,
    fragmentShader: `
      uniform sampler2D tInk; uniform float focus; uniform float blur; uniform float sat;
      ${common}
      varying vec2 vUv;
      float coc(vec2 uv){ float z = viewZ(uv); return clamp(abs(z - focus) / z * 0.9, 0.0, 1.0); }
      void main(){
        float c = coc(vUv) * blur;
        vec3 acc = texture2D(tInk, vUv).rgb; float wsum = 1.0;
        if (c > 0.5) {
          for (int i = 0; i < 24; i++) {
            float a = float(i) * 2.39996;
            float r = sqrt(float(i) + 0.5) / sqrt(24.0);
            vec2 uv = vUv + vec2(cos(a), sin(a)) * r * c / res;
            float cs = coc(uv) * blur;
            float wgt = clamp(cs / max(c, 0.001), 0.15, 1.0);
            acc += texture2D(tInk, uv).rgb * wgt; wsum += wgt;
          }
        }
        vec3 col = acc / wsum;
        float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
        col = mix(vec3(l), col, sat);
        vec2 d = vUv - 0.5; d.x *= res.x / res.y;
        col *= 1.0 - 0.22 * smoothstep(0.35, 0.95, length(d));
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });

  const normalMat = new THREE.MeshNormalMaterial();
  const skyNormal = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.5, 0.5, 1.0) });

  function render(scene, camera, chars, focus) {
    inkMat.uniforms.near.value = finalMat.uniforms.near.value = camera.near;
    inkMat.uniforms.far.value = finalMat.uniforms.far.value = camera.far;
    finalMat.uniforms.focus.value = focus;

    // 1. colour + depth
    renderer.setRenderTarget(rtColor);
    renderer.render(scene, camera);

    // 2. normals (world alpha 1) and character flags (alpha 0)
    const saved = [];
    scene.traverse((o) => {
      if (o.userData.noNormal) { saved.push([o, "vis", o.visible]); o.visible = false; return; }
      if (!o.isMesh) return;
      saved.push([o, "mat", o.material]);
      o.material = o.userData.flagMat || (o.userData.isSky ? skyNormal : normalMat);
    });
    const bg = scene.background, fog = scene.fog;
    scene.background = null; scene.fog = null;
    renderer.setRenderTarget(rtNormal);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.setClearColor(0x000000, 1);
    scene.background = bg; scene.fog = fog;
    for (const [o, k, v] of saved) { if (k === "vis") o.visible = v; else o.material = v; }

    // 3. ink
    quad.material = inkMat;
    renderer.setRenderTarget(rtInk);
    renderer.render(qScene, qCam);

    // 4. lens + grade to screen
    quad.material = finalMat;
    renderer.setRenderTarget(null);
    renderer.render(qScene, qCam);
  }
  return { render };
}
