
const ColorScheme = ['#db522c', '#edb71f', '#15ba57', '#22c5f9', '#832cff', '#f0edfc', '#110d1c'];
let defaultBubbleSize = 200;
let defaultTaskTitle = "Task Name";
let editCancelDelay = 200;
let popHoldDelay = 500;
let editPosition = { x: window.innerWidth / 2, y: window.innerHeight / 4 };
let cancelMovementBuffer = 30;

//#region Utilities
function lerp(t, MinInput, MaxInput, MinOutput, MaxOutput) {
    return MinOutput + ((t - MinInput) * (MaxOutput - MinOutput)) / (MaxInput - MinInput);
}

function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function RandomPosAroundCenter(magnitude = 1) {
    let centerPoint = Vector.create(render.canvas.width / 2, render.canvas.height / 2);
    let newX = (Math.random() > 0.5 ? 1 : -1) * Math.max(Math.random(), 0.7) * magnitude;
    let newY = (Math.random() > 0.5 ? 1 : -1) * Math.max(Math.random(), 0.7) * magnitude;
    return Vector.create(centerPoint.x + newX, centerPoint.y + newY);
}
//#endregion

