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
        var fontSize = Math.sqrt(area / this.body.title.length * 0.2);

        context.fillStyle = '#fff'; // Text color
        context.font = "600 " + fontSize + "px Poppins"; // Text size and font
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        let wrappedText = this.WrapText(context, this.body.title, pos.x, pos.y, Math.sqrt(this.body.area), fontSize, 3);
        let textHeight = wrappedText.length * fontSize;
        let startY = pos.y - textHeight / 2 + fontSize / 2; // Adjust startY to center text vertically

        wrappedText.forEach(function (item, index) {
            context.fillText(item[0], item[1], startY + index * fontSize);
        });
    }

    WrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
        let words = text.split(' ');
        let line = '';
        let testLine = '';
        let lineArray = [];
        let linesCount = 0;

        for (var n = 0; n < words.length; n++) {
            let word = words[n];
            testLine = line + word + ' ';
            let metrics = ctx.measureText(testLine);
            let testWidth = metrics.width;

            if (testWidth > maxWidth && n > 0) {
                lineArray.push([line.trim(), x, y]);
                y += lineHeight;
                line = word + ' ';
                linesCount++;

                if (linesCount >= maxLines - 1) {
                    line += words.slice(n + 1).join(' ');
                    lineArray.push([line.trim(), x, y]);
                    break;
                }
            } else {
                line += word + ' ';
            }

            if (n === words.length - 1) {
                if (linesCount < maxLines - 1) {
                    lineArray.push([line.trim(), x, y]);
                } else if (linesCount === maxLines - 1 && lineArray.length < maxLines) {
                    lineArray.push([line.trim(), x, y]);
                }
            }
        }

        // Ensure no duplication of the last line
        if (linesCount >= maxLines && line.trim().length > 0) {
            lineArray[maxLines - 1][0] += ' ' + line.trim();
        }

        return lineArray;
    }

    DrawDate() {
        var context = render.context;
        var area = this.body.area;
        var fontSize = Math.sqrt(area / this.body.date.length * 0.1);
        let pos = { x: this.body.position.x, y: this.body.position.y };
        context.fillStyle = '#fff ';
        context.font = fontSize + 'px Poppins';
        context.textAlign = 'center';
        context.textBaseline = 'top';

        let text = this.body.date.replaceAll("-", ".");
        let lines = text.split("T");

        // Draw each line separately
        for (let i = 0; i < lines.length; i++) {
            context.fillText(lines[i], pos.x, pos.y + fontSize * 3 + (i * fontSize * 1.2));
        }
    }
}