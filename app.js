
//#region Matter.js setup
var Engine = Matter.Engine,
  Bodies = Matter.Bodies,
  Body = Matter.Body,
  Bounds = Matter.Bounds,
  Composite = Matter.Composite,
  Composites = Matter.Composites,
  Events = Matter.Events,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Mouse = Matter.Mouse,
  Query = Matter.Query,
  MouseConstraint = Matter.MouseConstraint,
  Vector = Matter.Vector,
  World = Matter.World;

let engine = Engine.create();

engine.gravity.scale = 0;

let runner = Runner.create()

let render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width: window.innerWidth,
    height: window.innerHeight,
    background: ColorScheme[5],
  },
});

render.canvas.style = "transition: 0.3s; -webkit-transition: 0.3s;";


//#region Mouse Setup
let mouse = Mouse.create(render.canvas);

let mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    render: { visible: false },
  },
});

render.mouse = mouse;
//#endregion

//#endregion

//#region Instantiate Objects
let addTaskButton = new AddTaskButton();
let bubbleStack = Composites.stack();
//#endregion

let ClusterScaler = 1;

//#region Refrence Html Elements
const closeTaskForm = document.querySelector(".close-task-form");
const addTaskForm = document.querySelector(".add-task");
const colorButtons = document.querySelectorAll(".colorBtn")
const sizeButtons = document.querySelectorAll(".sizeBtn")
const sizeButtonDivs = document.querySelectorAll(".sizeBtnDiv")
const titleInput = document.getElementById("title-input");
const colorInput = document.getElementById("color-input");
const themeInput = document.getElementById("theme-input");
const dateInput = document.getElementById('datetime-picker');
const dateDisplay = document.getElementById('date-display');
const timeDisplay = document.getElementById('time-display');
const themeMeta = document.querySelector('meta[name="theme-color"]');
const infoContainer = document.getElementById('info-container');
const autoscaleIcon = document.getElementById('autoscaling-icon');
//#endregion

//START
document.addEventListener("DOMContentLoaded", event => {

  autoscaleIcon.style.fill = ColorScheme[6];

  colorButtons.forEach((btn, i) => {
    btn.style.backgroundColor = ColorScheme[i];
    btn.addEventListener("click", SetNewBubbleColor);
  });

  sizeButtons.forEach((btn, i) => {
    sizeButtonDivs[i].style.padding = btn.value + "rem";
    btn.addEventListener("click", SetNewBubbleScale);
  });

  dateInput.addEventListener('change', function () {
    let dateTime = this.value.split("T");
    dateDisplay.textContent = dateTime[0];
    timeDisplay.textContent = dateTime[1];
  });

  LoadData();
});


let darkTheme = false;
function ToggleTheme() {
  darkTheme = !darkTheme;
  if (!darkTheme) {
    render.options.background = ColorScheme[5];
    themeMeta.setAttribute('content', ColorScheme[5]);
    autoscaleIcon.style.fill = ColorScheme[6];
    autoscaleIcon.style.filter = 'drop-shadow(1px 3px 5px rgb(0, 0, 0, 0.2))';

  }
  else {
    render.options.background = ColorScheme[6];
    themeMeta.setAttribute('content', ColorScheme[6]);
    autoscaleIcon.style.fill = ColorScheme[5];
    autoscaleIcon.style.filter = 'drop-shadow(1px 3px 5px rgb(1, 1, 1, 0.2))';
  }
  SaveTheme();
}

//#region Task Editing and Creation
let editedBubble;
let isEditing = false;

function ToggleInfoDiv() {
  infoContainer.classList.toggle("active");
}

function ToggleTaskForm() {
  addTaskForm.classList.toggle("active");
  closeTaskForm.classList.toggle("active");
  isEditing = !isEditing;
  if (isEditing) {
    World.remove(engine.world, mouseConstraint);
    editedBubble.StartModify();
  }
  else {
    World.add(engine.world, mouseConstraint);
  }
}

function StartCreatingTask() {
  editedBubble = new TaskBubble();
  ToggleTaskForm();
}

function StartEditingTask(bubble) {
  editedBubble = bubble;
  ToggleTaskForm();
}

function SetNewBubbleColor() {
  const colorIndex = parseInt(this.value);
  const selectedColor = ColorScheme[colorIndex];
  editedBubble.SetColor(selectedColor);
}

function SetNewBubbleScale() {
  const size = parseFloat(this.value);
  editedBubble.SetScale(size);
}

function ConfirmTaskCreation() {
  if (editedBubble == null) return;

  ToggleTaskForm();
  editedBubble.FinishModify();
}
//#endregion

//#region Mouse Events
let mouseTarget;
let lastMouseDownTime = 0;
let startMousePos = { x: mouseConstraint.mouse.position.x, y: mouseConstraint.mouse.position.y };
let panning = false;

Events.on(mouseConstraint, "mousedown", function (e) {
  if (e.mouse.button != '' || e.touch || panning) return;
  mouseDown = true;
  lastMouseDownTime = engine.timing.timestamp;

  if (editedBubble != null) {
    return;
  }

  if (mouseTarget != null) {
    if (bubbleStack.bodies.includes(mouseTarget)) {
      mouseTarget.taskBubble.EndPress();
      mouseTarget.taskBubble.ClearOutline();
    }
  }

  mouseTarget = Query.point([addTaskButton.body, ...bubbleStack.bodies], mouseConstraint.mouse.position)[0];

  if (mouseTarget != null) {
    if (addTaskButton.body == mouseTarget && editedBubble == null) {
      addTaskButton.StartPress();
    }

    else if (bubbleStack.bodies.includes(mouseTarget)) {
      mouseTarget.taskBubble.StartPress();
      startMousePos = Vector.create(mouseConstraint.mouse.position.x, mouseConstraint.mouse.position.y);
    }
  }

})


Events.on(mouseConstraint, "mouseup", function (e) {

  if (addTaskButton.Pressed) addTaskButton.EndPress();

  if (editedBubble != null) {
    return;
  }

  if (mouseTarget != null) {

    if (mouseTarget == Query.point([addTaskButton.body, ...bubbleStack.bodies], { x: mouseConstraint.mouse.position.x, y: mouseConstraint.mouse.position.y })[0]) {
      if (mouseTarget == addTaskButton.body) {
        StartCreatingTask();
      }

      if (bubbleStack.bodies.includes(mouseTarget)) {
        mouseTarget.taskBubble.EndPress();

        let clickDuration = engine.timing.timestamp - lastMouseDownTime;

        if (Vector.magnitude(Vector.sub(startMousePos, mouse.position)) <= cancelMovementBuffer) {

          if (clickDuration > popHoldDelay) {
            mouseTarget.taskBubble.PopBubble();
          }
          else {
            if (clickDuration < editCancelDelay) {
              StartEditingTask(mouseTarget.taskBubble);
            }

            mouseTarget.taskBubble.ClearOutline();
          }
        }
      }
    }
  }

});
//#endregion

//#region Bubble Simulation

//#region UPDATE
Events.on(engine, "beforeUpdate", function () {

  ScaleBoard();

  SetBubblesAttraction()
  const scaleX = (initialBounds.width) / (render.bounds.max.x - render.bounds.min.x);
  const scaleY = (initialBounds.height) / (render.bounds.max.y - render.bounds.min.y);
  const scale = Math.min(scaleX, scaleY);
  if (mouseTarget != null && bubbleStack.bodies.includes(mouseTarget) && Vector.magnitude(Vector.sub(startMousePos, mouse.position)) >= cancelMovementBuffer / scale) {
    {
      mouseTarget.taskBubble.EndPress();
      mouseTarget = null;
    }
  }
});

//#region GlobalScaling
// Ensure initial bounds are accessible in your main script
const initialBounds = {
  min: { x: render.bounds.min.x, y: render.bounds.min.y },
  max: { x: render.bounds.max.x, y: render.bounds.max.y },
  width: render.bounds.max.x - render.bounds.min.x,
  height: render.bounds.max.y - render.bounds.min.y
};

function ScaleBoard() {
  const currentWidth = render.bounds.max.x - render.bounds.min.x;
  const currentHeight = render.bounds.max.y - render.bounds.min.y;

  // Only scale the board if the current bounds match the initial bounds
  if (currentWidth === initialBounds.width && currentHeight === initialBounds.height) {

    if (autoscaleIcon.classList.contains("scale-pulse")) {
      autoscaleIcon.classList.remove("scale-pulse")
    }

    let scale = Matter.Common.clamp(1 + StackToScreenDifference() * 0.00005, 0.1, 1.9);

    if (bubbleStack.bodies.length <= 0) {
      ClusterScaler = 1;
    } else {
      if (ClusterScaler < 0.1 && scale <= 1) return;
      bubbleStack.bodies.forEach(bubble => {
        Body.scale(bubble, scale, scale, bubble.position);
      });
      ClusterScaler *= scale;
    }
  }
  else if (!autoscaleIcon.classList.contains("scale-pulse")) {
    autoscaleIcon.classList.add("scale-pulse")
  }
}

function StackToScreenDifference() {
  let stackBounds = Composite.bounds(bubbleStack);
  let xL = stackBounds.min.x;
  let xR = render.bounds.max.x - stackBounds.max.x;
  let yL = stackBounds.min.y;
  let yR = render.bounds.max.y - stackBounds.max.y;
  let padding = 100;
  return Math.min(xL, xR, yL, yR) - padding;
}


function SetBubblesAttraction() {
  bubbleStack.bodies.forEach(bubble => {
    let force = Vector.mult(
      Vector.sub(addTaskButton.body.position, bubble.position), bubble.area * 0.000000005);
    Body.applyForce(bubble, bubble.position, force);

  });
}


Events.on(render, 'afterRender', function () {

  addTaskButton.DrawPlus();

  bubbleStack.bodies.forEach(bubble => {
    bubble.taskBubble.DrawText();
  });

});


//#endregion

// Add bodies to the world
World.add(engine.world, [bubbleStack, addTaskButton.body, mouseConstraint]);

// Run the engine and render
Runner.run(runner, engine);
Render.run(render);
//#endregion
