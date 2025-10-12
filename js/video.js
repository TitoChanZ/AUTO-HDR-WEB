var inputVideo = document.getElementById("videoLoader");

const video = document.getElementById("videoPlayer");
video.autoplay = true;
video.loop = true;
video.muted = true;
video.playsInline = true;
video.src = "video/video.mp4"; 


inputVideo.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const fileURL = URL.createObjectURL(file);
    video.src = fileURL;
    video.load();
    video.play();
  }
});

// Cargar shader externo


video.addEventListener("loadeddata", async () => {
  initHDRVideo(canvas, video, shaderCode);
});

async function initHDRVideo(canvas, videoElement, shaderCode) {
  if (!navigator.gpu) {
    alert("Sin soporte para WebGPU");
    setTitle("Error: Sin soporte para WebGPU")
    return;
  }
  // const canvas = document.getElementById(canvasId);
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu");

  const format = "rgba16float";
  context.configure({
    device,
    format,
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    colorSpace: "display-p3",
  });

  const sampler = device.createSampler({ magFilter: "linear", minFilter: "linear" });

  // Textura HDR simulada
  const texture = device.createTexture({
    size: [videoElement.videoWidth || 640, videoElement.videoHeight || 360],
    format: "rgba8unorm",
    usage: GPUTextureUsage.TEXTURE_BINDING |
           GPUTextureUsage.COPY_DST |
           GPUTextureUsage.RENDER_ATTACHMENT,
  });

  canvas.width = videoElement.videoWidth || 640;
  canvas.height = videoElement.videoHeight || 360;

  const shader = device.createShaderModule({ code: shaderCode });

  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: { module: shader, entryPoint: "vs_main" },
    fragment: { module: shader, entryPoint: "fs_main", targets: [{ format }] },
    primitive: { topology: "triangle-list" }
  });

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: sampler },
      { binding: 1, resource: texture.createView() }
    ]
  });

  function frame() {
    if (videoElement.readyState >= 2) { // VIDEO_HAS_CURRENT_DATA
      device.queue.copyExternalImageToTexture(
        { source: videoElement },
        { texture },
        [canvas.width, canvas.height]
      );
    }

    const encoder = device.createCommandEncoder();
    const view = context.getCurrentTexture().createView();
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view,
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
        loadOp: "clear",
        storeOp: "store"
      }]
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
