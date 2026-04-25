import { useRef, useEffect, useState } from 'react';
import { Renderer, Program, Triangle, Mesh } from 'ogl';

const hexToRgb = (hex) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1],16)/255, parseInt(m[2],16)/255, parseInt(m[3],16)/255] : [1,1,1];
};

export function LightRays({
  raysOrigin = 'top-center',
  raysColor = '#00e5c7',
  raysSpeed = 1,
  lightSpread = 1,
  rayLength = 2,
  pulsating = false,
  fadeDistance = 1.0,
  saturation = 1.0,
  followMouse = true,
  mouseInfluence = 0.08,
  noiseAmount = 0.02,
  distortion = 0.04,
  className = ''
}) {
  const containerRef = useRef(null);
  const uniformsRef = useRef(null);
  const rendererRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });
  const animationIdRef = useRef(null);
  const cleanupRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;
    cleanupRef.current?.();

    const init = async () => {
      await new Promise(r => setTimeout(r, 10));
      if (!containerRef.current) return;

      const renderer = new Renderer({ dpr: Math.min(devicePixelRatio, 2), alpha: true });
      rendererRef.current = renderer;
      const gl = renderer.gl;
      gl.canvas.style.cssText = 'width:100%;height:100%;display:block;';
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(gl.canvas);

      const getOrigin = (w, h) => {
        const o = 0.2;
        switch(raysOrigin) {
          case 'top-left':    return { anchor:[0,-o*h], dir:[0.7,0.7] };
          case 'top-right':   return { anchor:[w,-o*h], dir:[-0.7,0.7] };
          default:            return { anchor:[0.5*w,-o*h], dir:[0,1] };
        }
      };

      const vert = `attribute vec2 position;varying vec2 vUv;void main(){vUv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
      const frag = `
        precision highp float;
        uniform float iTime,raysSpeed,lightSpread,rayLength,pulsating,fadeDistance,saturation,mouseInfluence,noiseAmount,distortion;
        uniform vec2 iResolution,rayPos,rayDir,mousePos;
        uniform vec3 raysColor;
        float noise(vec2 st){return fract(sin(dot(st,vec2(12.9898,78.233)))*43758.5453);}
        float rayStr(vec2 src,vec2 dir,vec2 coord,float sA,float sB,float spd){
          vec2 s2c=coord-src;
          float ca=dot(normalize(s2c),dir);
          float d=distortion*sin(iTime*1.5+length(s2c)*.005);
          float sp=pow(max(ca+d,0.),1./max(lightSpread,.001));
          float dist=length(s2c);
          float maxD=max(iResolution.x,iResolution.y)*rayLength;
          float lf=clamp((maxD-dist)/maxD,0.,1.);
          float ff=clamp((fadeDistance*max(iResolution.x,iResolution.y)-dist)/(fadeDistance*max(iResolution.x,iResolution.y)),0.,1.);
          float pulse=pulsating>.5?(0.85+0.15*sin(iTime*spd*4.)):1.;
          float bs=clamp((.5+.2*sin((ca+d)*sA+iTime*spd))+(.3+.2*cos(-(ca+d)*sB+iTime*spd*.8)),0.,1.);
          return bs*lf*ff*sp*pulse;
        }
        void main(){
          vec2 coord=gl_FragCoord.xy;
          vec2 dir=normalize(rayDir);
          if(mouseInfluence>0.){dir=normalize(mix(dir,normalize(mousePos*iResolution.xy-rayPos),mouseInfluence));}
          float r=rayStr(rayPos,dir,coord,45.2,31.4,.8*raysSpeed)*0.4
                 +rayStr(rayPos,dir,coord,28.5,19.8,1.2*raysSpeed)*0.4
                 +rayStr(rayPos,dir,coord,12.1,56.2,.5*raysSpeed)*0.2;
          r=pow(r,.7)*1.5;
          vec3 col=raysColor*r;
          if(noiseAmount>0.){col*=(1.-noiseAmount+noiseAmount*noise(coord*.01+iTime*.05));}
          if(saturation!=1.){float g=dot(col,vec3(.299,.587,.114));col=mix(vec3(g),col,saturation);}
          gl_FragColor=vec4(col,r);
        }`;

      const uniforms = {
        iTime:{value:0}, iResolution:{value:[1,1]},
        rayPos:{value:[0,0]}, rayDir:{value:[0,1]},
        raysColor:{value:hexToRgb(raysColor)},
        raysSpeed:{value:raysSpeed}, lightSpread:{value:lightSpread},
        rayLength:{value:rayLength}, pulsating:{value:pulsating?1:0},
        fadeDistance:{value:fadeDistance}, saturation:{value:saturation},
        mousePos:{value:[0.5,0.5]}, mouseInfluence:{value:mouseInfluence},
        noiseAmount:{value:noiseAmount}, distortion:{value:distortion}
      };
      uniformsRef.current = uniforms;

      const geo = new Triangle(gl);
      const prog = new Program(gl, { vertex:vert, fragment:frag, uniforms, transparent:true });
      const mesh = new Mesh(gl, { geometry:geo, program:prog });

      const resize = () => {
        if (!containerRef.current) return;
        const {clientWidth:w, clientHeight:h} = containerRef.current;
        renderer.setSize(w, h);
        const dpr = renderer.dpr;
        uniforms.iResolution.value = [w*dpr, h*dpr];
        const {anchor, dir} = getOrigin(w*dpr, h*dpr);
        uniforms.rayPos.value = anchor;
        uniforms.rayDir.value = dir;
      };

      const loop = (t) => {
        uniforms.iTime.value = t * 0.001;
        const s = 0.95;
        smoothMouseRef.current.x = smoothMouseRef.current.x*s + mouseRef.current.x*(1-s);
        smoothMouseRef.current.y = smoothMouseRef.current.y*s + mouseRef.current.y*(1-s);
        uniforms.mousePos.value = [smoothMouseRef.current.x, 1-smoothMouseRef.current.y];
        renderer.render({ scene: mesh });
        animationIdRef.current = requestAnimationFrame(loop);
      };

      window.addEventListener('resize', resize);
      resize();
      animationIdRef.current = requestAnimationFrame(loop);

      cleanupRef.current = () => {
        cancelAnimationFrame(animationIdRef.current);
        window.removeEventListener('resize', resize);
        gl.canvas.parentNode?.removeChild(gl.canvas);
      };
    };

    init();
    return () => cleanupRef.current?.();
  }, [isVisible, raysOrigin, raysColor, raysSpeed, lightSpread, rayLength, pulsating, followMouse, mouseInfluence, noiseAmount, distortion]);

  useEffect(() => {
    if (!followMouse) return;
    const move = (e) => {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      mouseRef.current = { x:(e.clientX-r.left)/r.width, y:(e.clientY-r.top)/r.height };
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [followMouse]);

  return <div ref={containerRef} className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden ${className}`} />;
}

export default LightRays;
