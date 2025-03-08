// Initialize Hydra with your canvas
const hydra = new Hydra({
    canvas: document.getElementById('myCanvas'),
    detectAudio: false
  });
  
  // Function to resize the canvas
  function resizeCanvas() {
    const canvas = document.getElementById('myCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Update Hydra resolution
    hydra.setResolution(window.innerWidth, window.innerHeight);
  }
  
  // Event listener for window resize
  window.addEventListener('resize', resizeCanvas);
  
  // Initial canvas sizing
  resizeCanvas();
  
  // Enter fullscreen function
  function enterFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
      elem.msRequestFullscreen();
    }
  }
  
  // Event listener for the fullscreen button
  document.getElementById('fullscreenBtn').addEventListener('click', () => {
    enterFullscreen();
    // Hide the button after entering fullscreen
    document.getElementById('fullscreenBtn').style.display = 'none';
  });
  
  // Auto-hide cursor
  let timeout;
  document.addEventListener('mousemove', () => {
    clearTimeout(timeout);
    document.body.style.cursor = 'default';
    timeout = setTimeout(() => {
      document.body.style.cursor = 'none';
    }, 2000); // Hide cursor after 2 seconds of inactivity
  });
  
  // Initialize CodeMirror editor
  let editor = CodeMirror.fromTextArea(document.getElementById('codeEditor'), {
    mode: "javascript",
    lineNumbers: true,
    theme: "monokai", // Optional: Use your preferred theme
    autofocus: true
  });
  
  // Set the initial code in the editor
  editor.setValue(`
    // s0.src.playbackRate = 2; // double the speed at which the video plays
    //s0.src.currentTime = 10; // seek to the 10th second
    //s0.src.loop = false; // don't loop the video
    
    s0.initVideo("videos/plant1.mp4");
    s1.initImage("images/000003960011.jpg")
    s2.initVideo("videos/plant3.mp4");
   
  
  
  //Intermissions
     s3.initVideo("videos/Encrypted1.mp4");
//  s3.src.playbackRate = 5;
s3.src.currentTime = 10;
  
  src(s3)
    //.scale(0.7)
      //.modulate(o3)
      //.modulateScale(o2,0.2)
     //.pixelate(400)
   .posterize(18,3.2)
     .contrast(5)
  // .contrast(() => Math.sin(time) * 2 + 2)
    .saturate(0)
 .brightness(0.1)
    .out(o0)
  
  
  
  
     /* Scene 1 */
  
   
     src(s0)
        .scale(6)
   //     .modulate(o3)
    //    .scale(() => Math.sin(time/10) + 2 )
        .contrast(() => 0.8 + mouse.x * 0.001)
    //    .brightness(-0.2)
   //     .pixelate(80,40)
//.contrast(4)
        .colorama(20)
        .saturate(0)
	 .posterize(20,2)
        .blend(o1)
   //    .out(o0)
  
  
      //  s0.src.playbackRate = 0
  
  
  osc(20, 0.01, 1.1)
        .kaleid(6)
        //.color(2.83,0.91,0.39)
        .rotate(0, 0.1)
        .modulate(o1, () => mouse.y * 0.0003)
        .scale(() => Math.sin(time) + 2 )
        .blend(o0)
        .diff(o2)
 .posterize(8,3.2)
        .saturate(0)
   //     .out(o1)
  
      shape(3, (0.01, ()=> 0.2 + a.fft[20]),1)
      //change within osc()
         .mult(osc(0.11, 0.1).modulate(osc(2.8).rotate(1.4,1), 3))
        .color(1,2,4)
        .saturate(0)
        .luma(1.2,0.05, (5, ()=> 2 + a.fft[3]))
        .scale(1.2, ()=> 0.9 + a.fft[3])
        .blend(o0)
        .diff(o1)// o0
        .modulate(o3)
    //    .out(o2)// o1
      
  
      
  voronoi(9,0.6,0.9)
  //.scale()
  .diff(o1)
    .pixelate(800,800)
    .posterize(18,1.2)
    .shift(0.9,0.5,0.7)
    .blend(o2)
    // .saturate(0)
  //  .out(o3)
  
  //  render(o2) 
  
  
   /* Scene 2 */
  
  /*
  
     //s1:photo
  src(s1)
    .scale(1)
     .modulate(o3)
     .modulateScale(o2,2)
    .pixelate(400,400)
    .posterize(2,3.2)
    .contrast(5)
    .contrast(() => Math.sin(time) * 5 + 2)
    .saturate(0)
    .out(o0)
  
  shape(7,0.2,0.5)
    .kaleid(3)
    .repeatX(0.2, 0.6)
    .scrollY(8)
    .rotate(3.14/2)
    //  .modulate(osc().rotate(() => time%360))
    .modulateScale(osc(1, 0.2))
    .out(o1)
  
  noise(2, 0.5)
  // src(s2)
    .invert([0.2,0.8])
    .contrast(() => Math.sin(time) * 5)
    .thresh(1.5,0.8)
    .colorama(0.7)
    .modulate(o2)
    // .modulateRotate(o3)
    .saturate(0)
    .contrast(() => Math.sin(time) * 5)
    .out(o2)
  
  gradient([0.1, 2, 1])
  // osc(60, 0.1, 0)
    .rotate(1,0.1)
    .saturate( () => Math.sin(time*0.1) )
    .diff(o1)
    .saturate(9)
    .modulate(o2)
    .out(o3)
  */
        render(o0) 
 
  `);
  
  // Function to evaluate the code from the editor
  function evaluateCode() {
    var code = editor.getValue();
    try {
      // Evaluate the code
      eval(code);
    } catch (e) {
      console.error("Error evaluating code:", e);
    }
  }
  
  // Evaluate code when the editor content changes
//   editor.on('changes', function() {
//     evaluateCode();
//   });
editor.on('keydown', function(cm, event) {
    // Check if Ctrl+Enter or Cmd+Enter is pressed
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault(); // Prevent default action if necessary
      evaluateCode();
    }
  });
  
  // Initial evaluation to render the initial visuals
  evaluateCode();
  
//   function hideCodeEditor() {
//     const editorElement = document.getElementById('codeEditor');
//     // Adjust the width threshold as needed
//     if (window.innerWidth >= 1024) {
//       editorElement.style.display = 'none';
//     } else {
//       editorElement.style.display = 'block';
//     }
//   }
  
//   // Call the function initially
//   hideCodeEditor();
  
//   // Add an event listener to handle window resize
//   window.addEventListener('resize', hideCodeEditor);
  


  
  