class TaskBubble {
    constructor(position, title = defaultTaskTitle, date, color = ColorScheme[Math.floor(Math.random() * ColorScheme.length)], scale = 1) {
        let pos = position == null ? editPosition : position;
        this.body = Bodies.circle(pos.x, pos.y, defaultBubbleSize, {
            friction: 5,
            frictionAir: 0.05,
            frictionStatic: 10,
            restitution: 0.3,
            render: {
                fillStyle: color,
            },
            collisionFilter: {
                group: 1,
                mask: 1,
                category: 1,
            }
        });
        this.body.title = title;
        this.body.date = date;
        this.body.taskBubble = this;
        this.body.scaler = scale;
        this.body.render.strokeStyle = this.brightenColor(color, 10)
        Composite.add(engine.world, this.body);
        Composite.move(engine.world, this.body, bubbleStack);
        Body.scale(this.body, ClusterScaler * scale, ClusterScaler * scale);
    }

    brightenColor(color, percent) {
        let num = parseInt(color.slice(1), 16), amt = Math.round(2.55 * percent);
        return `#${((1 << 24) + (Math.min(255, (num >> 16) + amt) << 16) + (Math.min(255, (num >> 8 & 0x00FF) + amt) << 8) + Math.min(255, (num & 0x0000FF) + amt)).toString(16).slice(1)}`;
    }

    StartModify() {
        if (this.body.title != defaultTaskTitle) {
            titleInput.value = this.body.title;
        }
        else {
            titleInput.value = null;
        }

        if (this.body.date != null) {
            dateInput.value = this.body.date;
        }
        else {
            dateInput.value = null;
        }
        editedBubble = this;
        this.body.isStatic = true;
        this.EndPress();
        this.editInterval = setInterval(() => {
            Body.setPosition(this.body, editPosition);
        }, 100);
    }

    FinishModify() {
        this.body.isStatic = false;
        this.EndPress();
        editedBubble = null;
        this.body.render.strokeStyle = this.brightenColor(this.body.render.fillStyle, 10);
        this.ClearOutline();
        clearInterval(this.editInterval);

        SaveData();
    }

    StartPress() {
        const endWidth = window.innerHeight * 0.035;
        this.outlineInterval = setInterval(() => {
            this.body.render.lineWidth = Math.min(lerp(engine.timing.timestamp, lastMouseDownTime, lastMouseDownTime + popHoldDelay, 0, endWidth), endWidth);
            if (this.body.render.lineWidth >= endWidth) {
                this.body.render.strokeStyle = this.brightenColor(this.body.render.fillStyle, 50);
            }

        }, engine.timing.lastDelta);

    }

    EndPress() {
        clearInterval(this.outlineInterval);
        Body.setVelocity(this.body, { x: 0, y: 0 });
        Body.setAngularVelocity(this.body, 0);
    }

    ClearOutline() {
        this.body.render.lineWidth = 0;
    }

    PopBubble() {
        Composite.remove(bubbleStack, [this.body]);
        SaveData();
        Composite.remove(engine.world, [this.body]);

    }

    SetScale(scale) {
        Body.scale(this.body, scale / this.body.scaler, scale / this.body.scaler);
        this.body.scaler = scale;
    }

    UpdateAttributes() {
        if (titleInput.value.length > 0) {
            this.body.title = titleInput.value;
        }
        else {
            this.body.title = defaultTaskTitle;
        }

        this.body.date = dateInput.value;
    }

    SetColor(color) {
        this.body.render.fillStyle = color;
    }

    DrawText() {
        this.DrawTitle();
        this.DrawDate();
    }

    DrawTitle() {
        var context = render.context;
        var pos = this.body.position;
        var area = this.body.area;
        var fontSize = Math.sqrt(area / this.body.title.length * 0.6) / 2;
        context.fillStyle = '#fff '; // Text color
        context.font = "500 " + fontSize + "px 'Rubik'"; // Text size and font
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.body.title, pos.x, pos.y);
    }

    DrawDate() {
        var context = render.context;
        var area = this.body.area;
        var fontSize = Math.sqrt(Math.sqrt(area) * 1.2) * 0.8;
        let adjustedFontSize = fontSize * rendererScale;
        let pos = { x: this.body.position.x * rendererScale, y: this.body.position.y * rendererScale };
        context.fillStyle = '#ddd '; // Text color
        context.font = adjustedFontSize + 'px Rubik'; // Text size and font
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        // Adjust positions based on metrics if necessary
        context.fillText(this.body.date, pos.x, pos.y + adjustedFontSize * 2);
    }

}