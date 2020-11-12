import { Component, createRef, h } from 'preact';
import { GPU } from 'gpu.js';

// const canvas = document.createElement('canvas');
// canvas.style.position = 'absolute';
// canvas.style.left = '0';
// canvas.style.top = '0';
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

// console.log(canvas);
// kernel();

let gpu;
let kernel;
let canvas;

// Original from https://www.shadertoy.com/view/ldy3RW
function beerKernel(time, red, green, blue, opacity) {

//
// void mainImage( out vec4 fragColor, in vec2 fragCoord )
// {
//   vec2 uv = fragCoord.xy / iResolution.xy;
  let uv = [this.thread.x / this.output.x, this.thread.y / this.output.y];
//   uv = uv*2.0 -1.0;
  uv = [
    (uv[0] * 2.0) - 1.0,
    (uv[1] * 2.0) - 1.0
  ];
//   uv.x *= iResolution.x / iResolution.y;
  uv[0] *= this.output.x / this.output.y;
//   vec3 r = normalize(vec3(uv, 1.9+(0.2*sin(iTime))));
  let r = normalizeArray3([uv[0], uv[1], 1.9 + (0.2 * Math.sin(time))]);
//   uv += 0.05*random(vec3(uv.xy,1.0));
  const uvRandom = specialRandom([uv[0], uv[1], 1.0]);
  uv = [
    uv[0] + (0.05 * uvRandom),
    uv[1] + (0.05 * uvRandom)
  ];
//   r = r*0.8+cross(r,vec3(0.0,1.0,0.0));
  let crossedR = crossArray3(r, [0.0, 1.0, 0.0]);
  r = [
    r[0] * 0.8 + crossedR[0],
    r[1] * 0.8 + crossedR[1],
    r[2] * 0.8 + crossedR[2]
  ];
//   r = r+0.2*cross(r,vec3(-1.4*sin(iTime*0.4+sin(0.7*(uv.x*0.5+0.1*iTime))),-2.0*cos(iTime*0.2),uv.y-2.0*sin(-uv.y)));
  crossedR = crossArray3(r, [
    -1.4 * Math.sin(time * 0.4 + Math.sin(0.7 * (uv[0] * 0.5 + 0.1 * time))),
    -2.0 * Math.cos(time * 0.2),
    uv[1] - 2.0 * Math.sin(-uv[1])]);
  r = [
    (r[0] + 0.2) * crossedR[0],
    (r[1] + 0.2) * crossedR[1],
    (r[2] + 0.2) * crossedR[2]
  ];
//   vec3 o = vec3(0.0,0.0,0.0);
  let o = [0.0, 0.0, 0.0];
//   o.y = -14.5*iTime+sin(iTime)*2.0;
  o[1] = -14.5 * time + Math.sin(time) * 2.0;
//
//
//   float t = trace(o,r, 0.4, iTime*0.2);
  let t = trace(o, r, 0.4, time * 0.2);
//   float tn = clamp(t*-0.05+1.4,0.0,2.0);
  let tn = clampNumber(t * -0.05 + 1.4, 0.0, 2.0);
//   o.y += 900.5;
  o[1] += 900.5;
//   t = trace(o+vec3(0.5,6.5,1.9),r, 0.8, iTime*0.8 + 10220.0);
  t = trace([
    o[0] + 0.5,
    o[1] + 6.5,
    o[2] + 1.9
  ], r, 0.8, time * 0.8 + 10220.0);
//   tn += 0.2*clamp(t*-0.05+1.4,0.0,2.0);
  tn += 0.2 * clampNumber(t * -0.05 + 1.4, 0.0, 2.0);
//   tn *= 0.6;
  tn *= 0.6;
//   /*
//   o.y += 1.6;
//   t = trace(o,r, 0.2, iTime + 40.0);
//   tn += clamp(t*-0.05+1.4,0.0,2.0);
//   o.y += 1.7;
//   t = trace(o,r, 0.3, iTime + 60.0);
//   tn += clamp(t*-0.05+1.4,0.0,2.0);*/
//
//
//   fragColor = vec4(tn)*0.3*vec4(1.0,0.8,0.4,1.0)+vec4(0.5*cos(uv.x*0.6)+0.4*cos((uv.y-2.0)*0.6),0.3*cos(uv.x*0.7)+0.4*cos((uv.y-2.0)*0.6),0.1,0.0) ;
//   //fragColor = vec4(0.2,0.17,0.1,0.0)*0.8*(uv.y*2.8+1.5)+vec4(0.2,0.08,0.0,0.0)+vec4(fc*vec3(28.0,15.0+-1.0*length(uv+vec2(0.0,1.0)),6.4)*1.2/length(uv+vec2(0.0,1.3))*1.0,1.0);
//   this.color(red, green, blue, opacity);
  this.color(
    tn * 0.3 * 1.0 + (0.5 * Math.cos(uv[0] * 0.6) + 0.4 * Math.cos((uv[1] - 2.0) * 0.6)),
    tn * 0.3 * 0.8 + (0.3 * Math.cos(uv[0] * 0.7) + 0.4 * Math.cos((uv[1] - 2.0) * 0.6)),
    tn * 0.3 * 0.4 + 0.1,
    tn * 0.3 * 1.0
  );
// }
}

function normalizeArray3(v) {
  const length = Math.sqrt((v[0] * v[0]) + (v[1] * v[1]) + (v[2] * v[2]));
  return [
    v[0] / length,
    v[1] / length,
    v[2] / length
  ];
}
function crossArray3(x, y) {
  return [
    x[1] * y[2] - y[1] * x[2],
    x[2] * y[0] - y[2] * x[0],
    x[0] * y[1] - y[0] * x[1]
  ];
}
function clampNumber(v, a, b) {
  return Math.max(Math.min(v, Math.max(a, b)), Math.min(a, b));
}
// vec4 cellColor = vec4(0.0,0.0,0.0,0.0);
// vec3 cellPosition = vec3(0.0,0.0,0.0);
// float cellRandom = 0.0, onOffRandom = 0.0;
//
//
// float random (vec3 i){
//   return fract(sin(dot(i.xyz,vec3(4154895.34636,8616.15646,26968.489)))*968423.156);
// }
//
function degreesToRadians(degrees) {
  return degrees * (Math.PI/180);
}
// vec4 getColorFromFloat (float i){
function getColorFromFloat(i) {
//   i *= 2000.0;
  i *= 2000.0;
//   return vec4(normalize(vec3(abs(sin(i+radians(45.0))),abs(sin(i+radians(90.0))),abs(sin(i)))),1.0);
  const normalized = normalizeArray3([
    Math.abs(Math.sin(i + degreesToRadians(45.0))),
    Math.abs(Math.sin(i + degreesToRadians(90.0))),
    Math.abs(Math.sin(i))
  ]);
  return [normalized[0], normalized[1], normalized[2], 1.0];
// }
}
//
// vec3 getPositionFromFloat (float i){
function getPositionFromFloat(i) {
//   i *= 2000.0;
  i *= 2000.0;
//   return vec3(normalize(vec3(abs(sin(i+radians(45.0))),abs(sin(i+radians(90.0))),abs(sin(i)))))-vec3(0.5,0.5,0.5);
  const normalized = normalizeArray3([
    Math.abs(Math.sin(i + degreesToRadians(45.0))),
    Math.abs(Math.sin(i + degreesToRadians(90.0))),
    Math.abs(Math.sin(i))
  ]);
  return [normalized[0] - 0.5, normalized[1] - 0.5, normalized[2] - 0.5];
// }
}
//

function array3Length(v) {
  return Math.sqrt((v[0] * v[0]) + (v[1] * v[1]) + (v[2] * v[2]));
}
// float map(vec3 p, float radius, float time){
function map(p, radius, time) {
//   //p *= 1.0;
//   cellRandom = random(floor((p*0.5)+0.0*vec3(0.5,0.5,0.5)));
  const cellRandomSeed = [
    Math.floor((p[0] + 0.5) * 0.5),
    Math.floor((p[1] + 0.5) * 0.5),
    Math.floor((p[2] + 0.5) * 0.5),
  ];
  let cellRandom = specialRandom(cellRandomSeed);
// onOffRandom = random(vec3(5.0,2.0,200.0)+floor((p*0.5)+0.0*vec3(0.5,0.5,0.5)));
  const onOffRandomSeed = [
    5.0 + Math.floor(p[0] * 0.5) * 0.5,
    2.0 + Math.floor(p[1] * 0.5) * 0.5,
    200.0 + Math.floor(p[2] * 0.5) * 0.5,
  ];
  let onOffRandom = specialRandom(onOffRandomSeed);
//   cellPosition = getPositionFromFloat(cellRandom);
  let cellPosition = getPositionFromFloat(cellRandom);
//   p.x = mod(p.x, 2.0);
  //   p.y = mod(p.y, 2.0);
  //   p.z = mod(p.z, 2.0);
  p[0] = mod(p[0], 2.0);
  p[1] = mod(p[1], 2.0);
  p[2] = mod(p[2], 2.0);
//   p += 1.0*cellPosition.xyz;
  p = [
    p[0] + (1.0 * cellPosition[0]),
    p[1] + (1.0 * cellPosition[1]),
    p[2] + (1.0 * cellPosition[2])
  ];
//   p += p.xyz*sin(10.0*(time+onOffRandom*500.0))*			0.2;
  let offset = Math.sin(10.0 * (time + onOffRandom * 500.0)) * 0.2;
  p = [
    p[0] + p[0] * offset,
    p[1] + p[1] * offset,
    p[2] + p[2] * offset
  ];
//   p += p.yzx*cos(10.0*(time+onOffRandom*500.0)+1561.355)*	0.2;
  offset = Math.cos(10.0 * (time + onOffRandom * 500.0) + 1561.355) * 0.2;
  p = [
    p[0] + p[1] * offset,
    p[1] + p[2] * offset,
    p[2] + p[0] * offset
  ];
//   if(onOffRandom>0.92){
  if (onOffRandom > 0.92) {
//     return length(p-vec3(1.0,1.0,1.0)) - (0.3*radius*(cellRandom+0.3))+0.01*(sin(time*(20.0*onOffRandom+cellRandom*2000.0)));
    let backgroundBubbles = array3Length([p[0] - 1.0, p[1] - 1.0, p[2] - 1.0]);
    let foreGroundBubbles = (0.3 * radius * (cellRandom + 0.3)) + 0.01 * (Math.sin(time * (20.0 * onOffRandom + cellRandom * 2000.0)));
    return backgroundBubbles - foreGroundBubbles;
//   } else {
  } else {
//     return 0.95;
    return 0.95;
//   }
  }
// }
}
//
// float trace(vec3 o, vec3 r, float radius, float time){
function trace(o, r, radius, time) {
//   float t = 0.5;
  let t = 0.5;
//   const int maxSteps = 62;
  const maxSteps = 62;
//   for (int i = 0; i < maxSteps; i++){
  for (let i = 0; i < maxSteps; i++){
//     vec3 p = o + r * t;
    let p = [o[0] + r[0] * t, o[1] + r[1] * t, o[2] + r[2] * t];
//     float d = map(p, radius, time);
    let d = map(p, radius, time);
//     t += d*0.48;
    t += d * 0.48;
//   }
  }
//   return t;
  return t;
// }
}

const beerColor = [1, .8, .4, 1];

export class Beer extends Component {
  ref = createRef();
  kernel = null;
  seconds = 0;
  red = 0;
  green = 0;
  blue = 0;
  componentDidMount() {
    if (!kernel) {
      gpu = new GPU({ canvas: this.ref.current });
      gpu.addNativeFunction('specialRandom', `float specialRandom(vec3 i) {
  return fract(sin(dot(i.xyz,vec3(4154895.34636,8616.15646,26968.489)))*968423.156);
}`);
      setTimeout(() => {
        this.kernel = gpu.createKernel(beerKernel, {
          output: [window.innerWidth, window.innerHeight],
          graphical: true,
        })
          .addFunction(normalizeArray3)
          .addFunction(crossArray3)
          .addFunction(clampNumber)
          .addFunction(degreesToRadians)
          .addFunction(getPositionFromFloat)
          .addFunction(array3Length)
          .addFunction(map)
          .addFunction(trace);
        const draw = () => {
          requestAnimationFrame(() => {
            this.seconds += 0.01;
            this.drawBeer();
            draw();
          });
        }
        draw();
      }, 1000);
    }
  }

  drawBeer() {
    if (!this.kernel) return;
    console.log(this.red);
    this.kernel(this.seconds, this.red, this.green, this.blue, this.opacity);
  }

  render(props, state, context) {
    this.red = props.red;
    this.green = props.green;
    this.blue = props.blue;
    this.opacity = props.opacity;
    return <canvas
      ref={this.ref}
      style={{
        ...props.style,
        position: 'fixed',
      }} />;
  }
}
