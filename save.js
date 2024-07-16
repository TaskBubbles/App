function SaveData() {
    let tasks = bubbleStack.bodies.map(bubble => {
        return {
            title: bubble.title,
            date: bubble.date,
            color: bubble.render.fillStyle,
            scale: bubble.scaler
        };
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function SaveTheme() {
    localStorage.setItem("dark-theme", JSON.stringify(darkTheme));
}

function LoadData() {

    let data = JSON.parse(localStorage.getItem("tasks"));

    data.forEach(bubble => {
        new TaskBubble(null, bubble.title, bubble.date, bubble.color, bubble.scale);
    });

    if (JSON.parse(localStorage.getItem("dark-theme"))) {
        themeInput.click();
    }
}