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

// function beerKernel() {
//   // vec4 cellColor = vec4(0.0,0.0,0.0,0.0);
//   // vec3 cellPosition = vec3(0.0,0.0,0.0);
//   // float cellRandom = 0.0, onOffRandom = 0.0;
//   //
//   //
//   // float random (vec3 i){
//   //   return fract(sin(dot(i.xyz,vec3(4154895.34636,8616.15646,26968.489)))*968423.156);
//   // }
//   //
//   // vec4 getColorFromFloat (float i){
//   //   i *= 2000.0;
//   //   return vec4(normalize(vec3(abs(sin(i+radians(45.0))),abs(sin(i+radians(90.0))),abs(sin(i)))),1.0);
//   // }
//   //
//   // vec3 getPositionFromFloat (float i){
//   //   i *= 2000.0;
//   //   return vec3(normalize(vec3(abs(sin(i+radians(45.0))),abs(sin(i+radians(90.0))),abs(sin(i)))))-vec3(0.5,0.5,0.5);
//   // }
//   //
//   // float map(vec3 p, float radius, float time){
//   //   //p *= 1.0;
//   //   cellRandom = random(floor((p*0.5)+0.0*vec3(0.5,0.5,0.5)));
//   //   onOffRandom = random(vec3(5.0,2.0,200.0)+floor((p*0.5)+0.0*vec3(0.5,0.5,0.5)));
//   //   cellColor = getColorFromFloat(cellRandom);
//   //   cellPosition = getPositionFromFloat(cellRandom);
//   //   p.x = mod(p.x, 2.0);
//   //   p.y = mod(p.y, 2.0);
//   //   p.z = mod(p.z, 2.0);
//   //   p += 1.0*cellPosition.xyz;
//   //   p += p.xyz*sin(10.0*(time+onOffRandom*500.0))*			0.2;
//   //   p += p.yzx*cos(10.0*(time+onOffRandom*500.0)+1561.355)*	0.2;
//   //   if(onOffRandom>0.92){
//   //     return length(p-vec3(1.0,1.0,1.0)) - (0.3*radius*(cellRandom+0.3))+0.01*(sin(time*(20.0*onOffRandom+cellRandom*2000.0)));
//   //   } else {
//   //     return 0.95;
//   //   }
//   // }
//   //
//   // float trace(vec3 o, vec3 r, float radius, float time){
//   //   float t = 0.5;
//   //   const int maxSteps = 62;
//   //   for (int i = 0; i < maxSteps; i++){
//   //     vec3 p = o + r * t;
//   //     float d = map(p, radius, time);
//   //     t += d*0.48;
//   //   }
//   //   return t;
//   // }
//   //
//   // void mainImage( out vec4 fragColor, in vec2 fragCoord )
//   // {
//   //   vec2 uv = fragCoord.xy / iResolution.xy;
//   let uv = [((this.thread.x / this.output.x) * 2) - 1, ((this.thread.y / this.output.y) * 2) - 1];
//     // uv = uv*2.0 -1.0;
//     uv[0] *= this.output.x / this.output.y;
//     // uv.x *= iResolution.x / iResolution.y;
//   // vec3 r = normalize(vec3(uv, 1.9+(0.2*sin(iTime))));
//   let r = [
//     uv[0] + Math.random(),
//     uv[1],
//     1.9+(0.2*Math.sin(time)),
//   ];
//
//     uv += 0.05*random(vec3(uv.xy,1.0));
//     r = r*0.8+cross(r,vec3(0.0,1.0,0.0));
//     r = r+0.2*cross(r,vec3(-1.4*sin(iTime*0.4+sin(0.7*(uv.x*0.5+0.1*iTime))),-2.0*cos(iTime*0.2),uv.y-2.0*sin(-uv.y)));
//     vec3 o = vec3(0.0,0.0,0.0);
//     o.y = -14.5*iTime+sin(iTime)*2.0;
//
//
//     float t = trace(o,r, 0.4, iTime*0.2);
//     float tn = clamp(t*-0.05+1.4,0.0,2.0);
//     o.y += 900.5;
//     t = trace(o+vec3(0.5,6.5,1.9),r, 0.8, iTime*0.8 + 10220.0);
//     tn += 0.2*clamp(t*-0.05+1.4,0.0,2.0);
//     tn *= 0.6;
//     /*
//     o.y += 1.6;
//     t = trace(o,r, 0.2, iTime + 40.0);
//     tn += clamp(t*-0.05+1.4,0.0,2.0);
//     o.y += 1.7;
//     t = trace(o,r, 0.3, iTime + 60.0);
//     tn += clamp(t*-0.05+1.4,0.0,2.0);*/
//
//
//     fragColor = /*vec4(tn)*/ * 0.3
//       * vec4(1.0,0.8,0.4,1.0)
//       + vec4(0.5*cos(uv.x*0.6) + 0.4*cos((uv.y-2.0)*0.6),0.3*cos(uv.x*0.7)+0.4*cos((uv.y-2.0)*0.6),0.1,0.0) ;
//     this.color(
//       1, .8, .4, 1
//     );
// }

const beerColor = [1, .8, .4, 1];

export class Beer extends Component {
  ref = createRef();
  kernel = null;
  componentDidMount() {
    if (!kernel) {
      gpu = new GPU({ canvas: this.ref.current });
      this.kernel = gpu.createKernel(function(time, red, green, blue, opacity) {
        this.color(red, green, blue, opacity);
        // this.color(1, .8, .5, 1);
      }, {
        output: [window.innerWidth, window.innerHeight],
        graphical: true,
      });
    }
    this.drawBeer(0.3803921568627451, 0.23921568627450981, 0.09803921568627451, 1);
  }

  drawBeer(red, green, blue, opacity) {
    if (!this.kernel) return;
    // this.kernel(Date.now(), 0.3803921568627451, 0.23921568627450981, 0.09803921568627451, 1);
    this.kernel(Date.now(), red, green, blue, 1);
  }

  render(props, state, context) {
    this.drawBeer(props.red, props.green, props.blue, props.opacity);
    return <canvas
      ref={this.ref}
      style={{
        ...props.style,
        width: window.innerWidth,
        height: window.innerHeight,
        position: 'fixed',
      }} />;
  }
}
