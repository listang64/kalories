export const VERTEX = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

export const FRAGMENT = `
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform float uFill;
uniform float uSlosh;
uniform float uOver;
uniform vec3 uColA;
uniform vec3 uColB;
uniform vec3 uColC;
uniform vec3 uColD;
uniform float uShape;
uniform float uSide;
uniform vec4 uGeom;
uniform float uDpr;
uniform float uPress;
uniform float uRipple;
uniform float uMargin;

const float PI = 3.14159265;
const vec3 ACCENT = vec3(1.0, 0.478, 0.102);

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * snoise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    amp *= 0.5;
  }
  return sum;
}

struct Gauge {
  float d;
  float t;
  float s;
  float len;
  float thick;
};

Gauge barShape(vec2 p) {
  float r = uGeom.y;
  vec2 q = vec2(max(abs(p.x) - uGeom.x, 0.0), p.y);
  Gauge g;
  g.len = 2.0 * (uGeom.x + r);
  g.d = length(q) - r;
  g.t = (p.x + uGeom.x + r) / g.len;
  g.s = p.y / r;
  g.thick = r;
  return g;
}

Gauge arcShape(vec2 p) {
  float R = uGeom.x;
  float r = uGeom.y;
  float gap = uGeom.z;
  vec2 v = p - vec2(uGeom.w, 0.0);
  float vx = max(v.x * uSide, 0.0);
  float phi = atan(vx, -v.y);
  float pc = clamp(phi, gap, PI - gap);
  vec2 c = R * vec2(sin(pc), -cos(pc));
  float cap = r / R;
  float a0 = gap - cap;
  float a1 = PI - gap + cap;
  Gauge g;
  g.len = R * (a1 - a0);
  g.d = length(vec2(vx, v.y) - c) - r;
  g.t = (phi - a0) / (a1 - a0);
  g.s = (R - length(v)) / r;
  g.thick = r;
  return g;
}

vec4 liquidGauge(Gauge g) {
  float glowPx = 7.0 * uDpr;
  if (g.d > uMargin) return vec4(0.0);

  float agitation = 1.0 + 4.0 * uSlosh + 1.5 * uOver;
  float along = g.t * g.len;
  float present = step(0.002, uFill);
  float topOff = smoothstep(0.97, 1.0, uFill);
  float front = uFill * g.len + topOff * 3.0 * g.thick + uSlosh * 6.0 * uDpr * sin(uTime * 9.0);
  float wave = uDpr * agitation * (1.2 * sin(g.s * 2.4 - uTime * 3.0 + g.t * 7.0) + 0.6 * sin(g.s * 5.3 + uTime * 4.6));
  float liquid = clamp(0.5 - (along - front - wave) / 1.5, 0.0, 1.0) * present;
  float k = clamp(g.t / max(uFill, 0.2), 0.0, 1.0);

  vec3 glowCol = mix(uColA, uColB, k);
  glowCol = mix(glowCol, ACCENT, smoothstep(0.7, 1.0, g.t) * uOver);
  float glowMask = clamp((front - along) / (10.0 * uDpr) + 0.5, 0.0, 1.0) * present;
  float fade = 1.0 - smoothstep(0.45 * uMargin, uMargin, g.d);
  float halo = exp(-max(g.d, 0.0) / glowPx) * 0.4 * glowMask * fade;

  if (g.d > 1.0) return vec4(glowCol * halo, halo);

  float edge = clamp(0.5 - g.d, 0.0, 1.0);
  vec3 col = vec3(0.0);
  if (liquid > 0.0) {
    float scale = 30.0 * uDpr;
    vec2 q = vec2(along / (scale * 2.0) - uTime * 0.22 * (1.0 + uOver), g.s * g.thick / scale);
    float n = 0.5 + 0.5 * fbm(q + 0.85 * fbm(q * 0.9 + uTime * 0.12));
    col = mix(uColA, uColB, clamp(k + (n - 0.5) * 0.4, 0.0, 1.0));
    col *= 0.9 + 0.32 * (n - 0.5);
    col *= 0.8 + 0.2 * (1.0 - g.s * g.s);
    col += 0.14 * exp(-pow((g.s - 0.55) / 0.22, 2.0));
    col = mix(col, ACCENT, smoothstep(0.72, 1.0, g.t) * uOver * 0.9);
    col += 0.18 * exp(-abs(along - front - wave) / (3.0 * uDpr)) * (1.0 - topOff);
  }

  vec3 track = vec3(0.06) + 0.035 * exp(-pow((g.s - 0.55) / 0.25, 2.0));
  vec3 inside = mix(track, col, liquid);
  float haloA = (1.0 - edge) * halo;
  return vec4(inside * edge + glowCol * haloA, edge + haloA);
}

vec4 orb(vec2 p) {
  float breath = 1.0 + 0.015 * (1.0 - cos(uTime * PI * 0.5));
  float R = uGeom.x * breath * (1.0 - 0.06 * uPress);
  float d = length(p) - R;
  vec3 glowCol = mix(uColB, uColD, 0.5);
  float halo = exp(-max(d, 0.0) / (R * 0.2)) * 0.42 * (1.0 - smoothstep(0.45 * uMargin, uMargin, d));
  if (d > 1.0) return vec4(glowCol * halo, halo);

  float edge = clamp(0.5 - d, 0.0, 1.0);
  vec2 uv = p / R;
  float a = uTime * 0.2;
  vec2 w = mat2(cos(a), -sin(a), sin(a), cos(a)) * uv * 0.95;
  vec2 warp = vec2(snoise(w * 0.8 + uTime * 0.1), snoise(w * 0.8 - uTime * 0.1 + 5.2));
  float n = 0.75 * snoise(w + 0.7 * warp) + 0.25 * snoise(w * 2.2 - uTime * 0.05);
  float b = uTime * 0.16;
  float m = smoothstep(-0.45, 0.45, 0.85 * n + 0.8 * dot(uv, vec2(cos(b), sin(b))));
  float tone = 0.5 + 0.5 * fbm(w * 1.4 - uTime * 0.08);
  vec3 violet = mix(uColA, uColB, tone);
  vec3 red = mix(uColC, uColD, tone);
  vec3 col = mix(violet, red, m);
  col += 0.14 * (1.0 - abs(m * 2.0 - 1.0)) * mix(uColB, uColD, 0.5);

  float z = sqrt(max(1.0 - dot(uv, uv), 0.0));
  col *= 0.5 + 0.5 * z;
  col += 0.22 * pow(1.0 - z, 3.0) * glowCol;
  vec2 h = uv - vec2(-0.38, 0.45);
  col += 0.42 * exp(-dot(h, h) * 14.0) + 0.07 * exp(-dot(h, h) * 3.0);
  vec2 h2 = uv - vec2(0.32, -0.52);
  col += 0.08 * exp(-dot(h2, h2) * 12.0);
  if (uRipple >= 0.0) {
    col += 0.45 * (1.0 - uRipple) * exp(-pow((length(uv) - uRipple * 1.2) / 0.08, 2.0));
  }

  float haloA = (1.0 - edge) * halo;
  return vec4(col * edge + glowCol * haloA, edge + haloA);
}

void main() {
  vec2 p = gl_FragCoord.xy - 0.5 * uRes;
  if (uShape > 1.5) {
    gl_FragColor = orb(p);
  } else if (uShape > 0.5) {
    gl_FragColor = liquidGauge(arcShape(p));
  } else {
    gl_FragColor = liquidGauge(barShape(p));
  }
}
`
