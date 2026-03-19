var title = document.getElementById("title")
var layoutControls = document.getElementById("layoutControls");

var configurationBtn = document.getElementById("configurationBtn");
var controlCompared = document.getElementById("controlCompared");
var viewsContainer = document.getElementById("viewsContainer");

var configurationPanel = document.getElementById("configurationPanel");
var rangeColorOptions = document.querySelectorAll("#rangeColorOption")
var canvas = document.getElementById("gpuCanvas");
var shaderCode;

// & Modal Config Elements

var selectDialog = document.getElementById("selectDialog")

var promCheck = document.getElementById("promCheck")
var rangeRed = document.getElementById("rangeRed")
var rangeGreen = document.getElementById("rangeGreen")
var rangeBlue = document.getElementById("rangeBlue")
var resetBtn = document.getElementById("resetBtn")


var configs = [
   {
    name: "Natural",
    config:{
      xProm: true,
      red:2.00,
      green:2.00,
      blue:2.00
    }
    // red:2.00,
    // green:2.00,
    // blue:2.00
  },
  {
    name: "Cyberpunk",
    config:{
      xProm: false,
      red:3.00,
      green:3.00,
      blue:3.00
    }
  },
  {
    name: "Brillo",
    config:{
      xProm: false,
      red:2.00,
      green:2.00,
      blue:2.00
    }
  }
]

initConfig()

// & variables

var checkProm = true;
var valueColorRed = 2.00;
var valueColorGreen = 2.00;
var valueColorBlue = 2.00;
// var valueColorExposure = 0;


// async function loadShader(path) {
//   const response = await fetch(path);
//   return await response.text();
// }
loadShader("shader/shader.wgsl")

async function loadShader(path) {
  const response = await fetch(path);
  shaderCode = await response.text();
  // shaderCode = shaderCode.replace("/valueRedRGB",valueColorRed)
  // shaderCode = shaderCode.replace("/valueGreenRGB",valueColorGreen)
  // shaderCode = shaderCode.replace("/valueBlueRGB",valueColorBlue)
  // console.log(shaderCode);
}

var adapter
var device
var paramsBuffer
var boolsBuffer
const paramsValues = new Float32Array(4); 
const boolValues = new Uint32Array(4);
initGpu()
async function initGpu() {
  if (!navigator.gpu) {
    alert("Sin soporte para WebGPU");
    setTitle("Error: Sin soporte para WebGPU")
    return;
  }
  adapter = await navigator.gpu.requestAdapter();
  device = await adapter.requestDevice();
  paramsBuffer = device.createBuffer({
    size: 16, // alineación obligatoria
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  boolsBuffer = device.createBuffer({
    size: 16, 
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // 4. Valores iniciales
  paramsValues.set([2.0, 2.0, 2.0, 0.0]);
  boolValues.set([0, 0, 0, 0]); // Todo desactivado al inicio

  device.queue.writeBuffer(paramsBuffer, 0, paramsValues);
  device.queue.writeBuffer(boolsBuffer, 0, boolValues);
}

function initConfig(){
  let i = 0;
  selectDialog.innerHTML = ""
  for (const config of configs) {
    selectDialog.innerHTML += `<option value="${i}" >${config.name}</option>`
    i++
  }
}

selectDialog.addEventListener("change", (e) => {
  loadConfig(e.target.value)
})
promCheck.addEventListener("change", (e) => {
  checkProm = e.target.checked
  updateShaderBuffer()
})


function loadConfig(index){
  // ^ Valores
  checkProm = configs[index].config.xProm
  valueColorRed = configs[index].config.red
  valueColorGreen = configs[index].config.green
  valueColorBlue = configs[index].config.blue
  
  // ^ Actualizar interfaz
  promCheck.checked = checkProm
  rangeRed.updateValue(valueColorRed)
  rangeGreen.updateValue(valueColorGreen)
  rangeBlue.updateValue(valueColorBlue)

  updateShaderBuffer()
}

function updateShaderBuffer(){
  sendShaderBuffer(valueColorRed,valueColorGreen,valueColorBlue,checkProm)
}

function sendShaderBuffer(r, g, b,xProm) {
  paramsValues[0] = r;
  paramsValues[1] = g;
  paramsValues[2] = b;
  paramsValues[3] = 0.0;

  boolValues[0] = xProm ? 1 : 0;
  boolValues[1] = 0;
  boolValues[2] = 0;
  boolValues[3] = 0;

  device.queue.writeBuffer(paramsBuffer, 0, paramsValues);
  device.queue.writeBuffer(boolsBuffer, 0, boolValues);
}

function keyboardEvent(value, code) {
  if (value == 67) {
    configurationPanel.showModal()
  }
}

configurationBtn.addEventListener("click", () => {
  configurationPanel.showModal();
})

resetBtn.addEventListener("click", () => {
  loadConfig(selectDialog.value)
  console.log("Reset")
})
// configurationPanel.showModal();
// console.log("90".parseFloat.toFixed(2))
for (const rangeColorOption of rangeColorOptions) {
  let input = rangeColorOption.querySelector("input")
  let value = rangeColorOption.querySelector("span")
  input.labelValue = value

  input.updateValue = function(newValue) {
    this.value = newValue; // Se actualiza a sí mismo
    // let formattedValue = parseFloat(this.value).toFixed(2);
    this.labelValue.innerHTML = parseFloat(this.value).toFixed(2); // Actualiza su span vinculado
  }

  input.addEventListener("input", (e) => {
    let inputValue = parseFloat(input.value).toFixed(2);
    value.innerHTML = inputValue
    if (e.target.id == "rangeRed") {
      valueColorRed = inputValue
    } else if (e.target.id == "rangeGreen") {
      valueColorGreen = inputValue
    } else if (e.target.id == "rangeBlue") {
      valueColorBlue = inputValue
    }
    updateShaderBuffer()
  })
}


layoutControls.addEventListener("click", (e) => {
  if (e.target.nodeName == "BUTTON") {
    // for(layoutControls.children)
    // console.log(layoutControls.children);
    
    // console.log(e.target);
    let buttonId = e.target.id;
    if(buttonId == "configurationBtn") return;
    changeLayout(buttonId)
    // e.target.classList.toggle("activeBtn")

    // console.log(buttonId)
  }
  // console.log(e);
})


function setTitle(text) {
  title.innerHTML = text;
  document.title = text;
}

function changeLayout(layout) {
  var elements = layoutControls.children;
  // console.log(layout+"Status");

  for (const element of elements) {
    if (element.id == layout) {
      element.classList.add("activeBtn")
      viewsContainer.classList.add(layout + "Status")
    } else {
      element.classList.remove("activeBtn")
      viewsContainer.classList.remove(element.id + "Status")
    }
  }
}

var mousedown = false;
controlCompared.addEventListener("mousedown", (e) => {
  mousedown = true;
  // console.log(e)
})

viewsContainer.addEventListener("mousemove", (e) => {
  if (mousedown) {
    var widthView = e.view.innerWidth;
    var positionX = e.clientX;
    var porcentaje = (positionX / widthView) * 100
    // console.log(`WidthView: ${widthView} | PositionX: ${positionX} | % : ${(positionX/widthView)*100}%`);
    canvas.style.width = porcentaje + "%";
    controlCompared.style.left = porcentaje + "%"
    // console.log(e)
  }

})
viewsContainer.addEventListener("mouseup", () => {
  mousedown = false
})

controlCompared.addEventListener("mouseup", (e) => {
  mousedown = false
  // console.log(e)
})

// // Amplificar para simular HDR
//   // return vec4<f32>(color.rgb * 2.0, color.a);
//   // let boosted = vec3<f32>(color.r * 2.0, color.g * 1.0, color.b * 2.0);

//   // Aplicar solo a los colores claros
//   let promedio =  (color.r + color.g + color.b) / 3.0;
//   // console.log(promedio);
//   let colorFinal = vec3<f32>(2.0, 0.0, 0.0);
//   if (promedio >= 0.0) {
//     // return vec4<f32>(color.rgb * ( pow(2.0, promedio)), color.a);
//     // return vec4<f32>(color.r * ( pow(2.0, color.r)), color.g * ( pow(2.0, color.g)), color.b * ( pow(2.0, color.b)), color.a);
//     // return vec4<f32>(color.rgb * 2, color.a);
//   } else {
//     // colorFinal = color.rgb;
//     return vec4<f32>(color.rgb, color.a);
//   }
//   // return vec4<f32>(colorFinal, color.a);

// He creado una demostración  de un visualizador y transformador automático de contenido SDR a HDR usando  WebGPU y Shader. Solo funciona con pantallas compatibles con HDR. Soporte para imágenes y vídeos.