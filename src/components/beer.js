import { Component, createRef, h } from 'preact';
import { GPU } from 'gpu.js';

let gpu;
let kernel;

// Original from https://www.shadertoy.com/view/ldy3RW
function beerKernel(time, red, green, blue, opacity) {
  let uv = [this.thread.x / this.output.x, this.thread.y / this.output.y];
  uv = [
    (uv[0] * 2.0) - 1.0,
    (uv[1] * 2.0) - 1.0
  ];
  uv[0] *= this.output.x / this.output.y;

  let r = normalizeArray3([uv[0], uv[1], 1.9 + (0.2 * Math.sin(time))]);
  const uvRandom = specialRandom([uv[0], uv[1], 1.0]);
  uv = [
    uv[0] + (0.05 * uvRandom),
    uv[1] + (0.05 * uvRandom)
  ];
  let crossedR = crossArray3(r, [0.0, 1.0, 0.0]);
  r = [
    r[0] * 0.8 + crossedR[0],
    r[1] * 0.8 + crossedR[1],
    r[2] * 0.8 + crossedR[2]
  ];
  crossedR = crossArray3(r, [
    -1.4 * Math.sin(time * 0.4 + Math.sin(0.7 * (uv[0] * 0.5 + 0.1 * time))),
    -2.0 * Math.cos(time * 0.2),
    uv[1] - 2.0 * Math.sin(-uv[1])]);
  r = [
    (r[0] + 0.2) * crossedR[0],
    (r[1] + 0.2) * crossedR[1],
    (r[2] + 0.2) * crossedR[2]
  ];
  let o = [0.0, 0.0, 0.0];
  o[1] = -14.5 * time + Math.sin(time) * 2.0;

  let t = trace(o, r, 0.2, time * 0.2);
  let tn = clampNumber(t * -0.05 + 1.4, 0.0, 2.0);
  o[1] += 900.5;
  t = trace([
    o[0] + 0.5,
    o[1] + 6.5,
    o[2] + 2.9
  ], r, 0.8, time * 0.8 + 10220.0);
  tn += 0.2 * clampNumber(t * -0.05 + 1.4, 0.0, 2.0);
  tn *= 0.6;

  this.color(
    (tn * 0.3) + (red * 0.3) + (0.4 * Math.cos(uv[0] * 0.6) + 0.4 * Math.cos((uv[1] - 2.0) * 0.6)),
    (tn * 0.3) + (green * 0.3) + (0.3 * Math.cos(uv[0] * 0.7) + 0.4 * Math.cos((uv[1] - 2.0) * 0.6)),
    (tn * 0.3) + (blue * 0.3) + 0.1,
    (tn * 0.3) + opacity
  );
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
function degreesToRadians(degrees) {
  return degrees * (Math.PI/180);
}
function getPositionFromFloat(i) {
  i *= 2000.0;
  const normalized = normalizeArray3([
    Math.abs(Math.sin(i + degreesToRadians(45.0))),
    Math.abs(Math.sin(i + degreesToRadians(90.0))),
    Math.abs(Math.sin(i))
  ]);
  return [normalized[0] - 0.5, normalized[1] - 0.5, normalized[2] - 0.5];
}

function array3Length(v) {
  return Math.sqrt((v[0] * v[0]) + (v[1] * v[1]) + (v[2] * v[2]));
}
function map(p, radius, time) {
  const cellRandomSeed = [
    Math.floor((p[0] + 0.5) * 0.5),
    Math.floor((p[1] + 0.5) * 0.5),
    Math.floor((p[2] + 0.5) * 0.5),
  ];
  let cellRandom = specialRandom(cellRandomSeed);
  const onOffRandomSeed = [
    5.0 + Math.floor(p[0] * 0.5) * 0.5,
    2.0 + Math.floor(p[1] * 0.5) * 0.5,
    200.0 + Math.floor(p[2] * 0.5) * 0.5,
  ];
  let onOffRandom = specialRandom(onOffRandomSeed);
  let cellPosition = getPositionFromFloat(cellRandom);
  p[0] = mod(p[0], 2.0);
  p[1] = mod(p[1], 2.0);
  p[2] = mod(p[2], 2.0);
  p = [
    p[0] + (1.0 * cellPosition[0]),
    p[1] + (1.0 * cellPosition[1]),
    p[2] + (1.0 * cellPosition[2])
  ];
  let offset = Math.sin(10.0 * (time + onOffRandom * 500.0)) * 0.2;
  p = [
    p[0] + p[0] * offset,
    p[1] + p[1] * offset,
    p[2] + p[2] * offset
  ];
  offset = Math.cos(10.0 * (time + onOffRandom * 500.0) + 1561.355) * 0.2;
  p = [
    p[0] + p[1] * offset,
    p[1] + p[2] * offset,
    p[2] + p[0] * offset
  ];
  if (onOffRandom > 0.92) {
    let backgroundBubbles = array3Length([p[0] - 1.0, p[1] - 1.0, p[2] - 1.0]);
    let foreGroundBubbles = (0.3 * radius * (cellRandom + 0.3)) + 0.01 * (Math.sin(time * (20.0 * onOffRandom + cellRandom * 2000.0)));
    return backgroundBubbles - foreGroundBubbles;
  } else {
    return 0.95;
  }
}

function trace(o, r, radius, time) {
  let t = 0.5;
  const maxSteps = 62;
  for (let i = 0; i < maxSteps; i++){
    let p = [o[0] + r[0] * t, o[1] + r[1] * t, o[2] + r[2] * t];
    let d = map(p, radius, time);
    t += d * 0.48;
  }
  return t;
}

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
          if (this.seconds > 10) {
            this.seconds = 0.0;
          }
          this.drawBeer();
          draw();
        });
      }
      draw();
    }
  }

  drawBeer() {
    if (!this.kernel) return;
    console.log(this.red, this.green, this.blue, this.opacity);
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
