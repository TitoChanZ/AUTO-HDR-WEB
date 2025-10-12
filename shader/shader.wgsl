@group(0) @binding(0) var mySampler: sampler;
@group(0) @binding(1) var myTexture: texture_2d<f32>;

struct VSOut {
  @builtin(position) pos: vec4<f32>,
  @location(0) uv: vec2<f32>
};

@vertex
fn vs_main(@builtin(vertex_index) vid: u32) -> VSOut {
  var pos = array<vec2<f32>, 6>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>( 1.0, -1.0),
    vec2<f32>(-1.0,  1.0),
    vec2<f32>(-1.0,  1.0),
    vec2<f32>( 1.0, -1.0),
    vec2<f32>( 1.0,  1.0)
  );

  var uv = array<vec2<f32>, 6>(
    vec2<f32>(0.0, 1.0),
    vec2<f32>(1.0, 1.0),
    vec2<f32>(0.0, 0.0),
    vec2<f32>(0.0, 0.0),
    vec2<f32>(1.0, 1.0),
    vec2<f32>(1.0, 0.0)
  );

  var out: VSOut;
  out.pos = vec4<f32>(pos[vid], 0.0, 1.0);
  out.uv = uv[vid];
  return out;
}

@fragment
fn fs_main(in: VSOut) -> @location(0) vec4<f32> {
  let color = textureSample(myTexture, mySampler, in.uv);

  // Aplicar solo a los colores claros
  let promedio =  (color.r + color.g + color.b) / 3.0;
  return vec4<f32>(color.rgb * ( pow(2.0, promedio)), color.a);
  // Aplicar a los colores
  // return vec4<f32>(color.r * ( pow(2.0, color.r)), color.g * ( pow(2.0, color.g)), color.b * ( pow(2.0, color.b)), color.a);
}
