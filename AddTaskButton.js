
class AddTaskButton {
    constructor() {
        this.body = Bodies.circle(this.startPos.x, this.startPos.y,
            defaultBubbleSize,
            {
                isStatic: true,
                render: {
                    fillStyle: '#29262D'
                },
            }
        );
        this.body.taskBubble = this;
        //this.body.collisionFilter.group = -1;
        this.Pressed = false;
    };

    startPos = { x: render.bounds.max.x / 2, y: render.bounds.max.y / 2 };
    editPos = { x: render.bounds.max.x / 2, y: render.bounds.max.y / 1.5 };

    StartPress() {
        this.Pressed = true;
        this.body.render.fillStyle = '#50505f';
    }

    EndPress() {
        this.Pressed = false;
        this.body.render.fillStyle = '#29262D';
    }

    DrawPlus() {
        var context = render.context;
        var pos = this.body.position;
        var area = this.body.area;
        var fontSize = 80;
        context.fillStyle = '#fff ';
        context.font = fontSize + 'px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'bottom';
        var metrics = context.measureText('+');
        context.fillText('+', pos.x, pos.y + metrics.width);
    }
}
