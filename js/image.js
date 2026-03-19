var inputImg = document.getElementById("imgLoader");
var displayImg = document.querySelector("img");

displayImg.src = "image/image1.jpg";

inputImg.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      displayImg.src = reader.result;
    };
  }
});

displayImg.onload = () => {
  // initHDRImage(canvas, displayImg.src, shaderCode);
};

async function initHDRImage(canvas, imagePath, shaderCode) {
  if (!navigator.gpu) {
    alert("Sin soporte para WebGPU");
    setTitle("Error: Sin soporte para WebGPU");
    return;
  }

  await initGpu();
  const context = canvas.getContext("webgpu");

  const format = "rgba16float";
  context.configure({
    device,
    format,
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    colorSpace: "display-p3",
    toneMapping: { mode: "extended" },
  });

  // Cargar imagen
  const img = new Image();
  img.src = imagePath;
  await img.decode();
  const bitmap = await createImageBitmap(img);

  //! Ajustar tamaño del canvas a la imagen
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  // Crear textura desde la imagen
  const texture = device.createTexture({
    size: [bitmap.width, bitmap.height],
    format: "rgba8unorm",
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT,
  });

  device.queue.copyExternalImageToTexture(
    { source: bitmap },
    { texture: texture },
    [bitmap.width, bitmap.height],
  );

  const sampler = device.createSampler({
    magFilter: "linear",
    minFilter: "linear",
  });

  console.log(shaderCode);
  // Shaders WGSL
  const shader = device.createShaderModule({ code: shaderCode });

  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: { module: shader, entryPoint: "vs_main" },
    fragment: {
      module: shader,
      entryPoint: "fs_main",
      targets: [{ format }],
    },
    primitive: { topology: "triangle-list" },
  });

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: sampler },
      { binding: 1, resource: texture.createView() },
      { binding: 2, resource: { buffer: paramsBuffer } },
      { binding: 3, resource: { buffer: boolsBuffer } },
    ],
  });

  function frame() {
    console.log();
    const encoder = device.createCommandEncoder();
    const view = context.getCurrentTexture().createView();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view,
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(6, 1, 0, 0);
    pass.end();
    device.queue.submit([encoder.finish()]);
    requestAnimationFrame(frame);
  }

  frame();
}
