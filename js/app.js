var title = document.getElementById("title")
var layoutControls = document.getElementById("layoutControls");


var controlCompared = document.getElementById("controlCompared");
var viewsContainer = document.getElementById("viewsContainer");

var canvas = document.getElementById("gpuCanvas");
var shaderCode;

// async function loadShader(path) {
//   const response = await fetch(path);
//   return await response.text();
// }
loadShader("shader/shader.wgsl")

async function loadShader(path) {
  const response = await fetch(path);
  shaderCode = await response.text();
  
}

layoutControls.addEventListener("click",(e)=>{
  if(e.target.nodeName == "BUTTON"){
    // for(layoutControls.children)
    // console.log(layoutControls.children);
    
    // console.log(e.target);
    let buttonId  = e.target.id;
    changeLayout(buttonId)
    // e.target.classList.toggle("activeBtn")
  
    // console.log(buttonId)
  }
    // console.log(e);
})


function setTitle(text){
  title.innerHTML = text;
  document.title = text;
}

function changeLayout(layout){
  var elements = layoutControls.children;
  // console.log(layout+"Status");
  
  for (const element of elements) {
    if(element.id == layout){
      element.classList.add("activeBtn")
      viewsContainer.classList.add(layout+"Status")
    }else{
      element.classList.remove("activeBtn")
      viewsContainer.classList.remove(element.id+"Status")
    }
  }
}

var mousedown = false;
controlCompared.addEventListener("mousedown",(e)=>{
  mousedown=true;
  // console.log(e)
})

viewsContainer.addEventListener("mousemove",(e)=>{
  if(mousedown){
    var widthView = e.view.innerWidth;
    var positionX = e.clientX;
    var porcentaje = (positionX/widthView)*100
    // console.log(`WidthView: ${widthView} | PositionX: ${positionX} | % : ${(positionX/widthView)*100}%`);
    canvas.style.width=porcentaje+"%";
    controlCompared.style.left = porcentaje+"%"
    // console.log(e)
  }
  
})
viewsContainer.addEventListener("mouseup",()=>{
  mousedown = false
})

controlCompared.addEventListener("mouseup",(e)=>{
  mousedown=false
  // console.log(e)
})

