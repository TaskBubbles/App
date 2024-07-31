class TaskBubble {
    constructor(position, title = defaultTaskTitle, date = '', color = ColorScheme[Math.floor(Math.random() * 5)], scale = 1, completed = false, identifier = 0) {
        let pos = position == null ? editPosition : position;
        this.body = Bodies.circle(pos.x, pos.y, defaultBubbleSize, {
            friction: 5,
            frictionAir: 0.05,
            frictionStatic: 10,
            restitution: 0.3,
            collisionFilter: {
                group: 1,
                mask: 1,
                category: 1,
            },
        });

        this.body.title = title;
        this.body.date = date;
        this.body.taskBubble = this;
        this.body.scaler = scale;
        this.body.completed = completed;
        this.body.color = color;
        this.SetColor(color);

        if (identifier == 0) {

            this.body.identifier = idCounter;
            idCounter++;
        }
        else {
            this.body.identifier = identifier;

        }

        Composite.add(engine.world, this.body);
        Composite.move(engine.world, this.body, bubbleStack);
        Body.scale(this.body, ClusterScaler * scale, ClusterScaler * scale);
    }

    brighterColor(percent) {
        let rgba = hexToRgba(this.body.color);

        rgba.r += percent;
        rgba.g += percent;
        rgba.b += percent;

        return rgbaToHex(rgba.r, rgba.g, rgba.b, rgba.a);
    }

    disabledColor() {
        let rgba = hexToRgba(this.body.color);

        rgba.a -= 0.3;

        return rgbaToHex(rgba.r, rgba.g, rgba.b, rgba.a);
    }

    SetColor(color) {
        this.body.color = color;
        this.body.render.fillStyle = this.body.completed ? this.disabledColor() : color;
        this.body.render.strokeStyle = this.body.completed ? this.disabledColor() : color;
    }

    StartModify() {
        resetZoom();
        scaling = false;
        for (let checkmark of completedCheckmark) {

            if (this.body.completed) {
                if (checkmark.classList.contains("hidden")) {
                    checkmark.classList.remove("hidden");
                }
            }
            else {
                if (!checkmark.classList.contains("hidden")) {
                    checkmark.classList.add("hidden");

                }
            }

            completedInput.checked = this.body.completed
        }

        if (this.body.title != defaultTaskTitle) {
            titleInput.value = this.body.title;
        }
        else {
            titleInput.value = null;
        }


        if (this.body.date != '') {
            let d = this.body.date;
            let text = d.replaceAll("-", ".");
            let lines = text.split("T");
            dateInput.value = d;
            dateDisplay.innerHTML = lines[0];
            timeDisplay.innerHTML = lines[1];
        }
        else {
            dateInput.value = '';
            dateDisplay.innerHTML = '';
            timeDisplay.innerHTML = '';
        }

        if (this.body.checked) {

        }

        editedBubble = this;
        this.body.isStatic = true;
        this.EndPress();
        this.editInterval = setInterval(() => {
            Body.setPosition(this.body, editPosition);
            this.UpdateAttributes();
        }, 100);
    }

    FinishModify() {
        scaling = true;
        this.body.isStatic = false;
        this.EndPress();
        editedBubble = null;
        this.body.render.strokeStyle = this.body.completed ? this.disabledColor() : this.body.color;
        this.ClearOutline();
        clearInterval(this.editInterval);

        if (this.body.completed) {
            let bubbleToUpdate = completedBubbles.find(bubble => bubble.identifier == this.body.identifier);
            if (bubbleToUpdate) {
                bubbleToUpdate.title = this.body.title;
                bubbleToUpdate.date = this.body.date;
                bubbleToUpdate.color = this.body.color;
                bubbleToUpdate.scale = this.body.scale;
            }

        }

        SaveData();
    }

    StartPress() {
        const endWidth = window.innerHeight * 0.035;
        this.outlineInterval = setInterval(() => {
            this.body.render.lineWidth = Math.min(lerp(engine.timing.timestamp, lastMouseDownTime, lastMouseDownTime + popHoldDelay, 0, endWidth), endWidth);
            if (this.body.render.lineWidth >= endWidth) {
                this.body.render.strokeStyle = this.body.completed ? this.disabledColor() : this.brighterColor(50);
            }

        }, engine.timing.lastDelta);

    }

    EndPress() {
        clearInterval(this.outlineInterval);
        this.ClearOutline();
        Body.setVelocity(this.body, { x: 0, y: 0 });
        Body.setAngularVelocity(this.body, 0);
    }

    ClearOutline() {
        this.body.render.lineWidth = 0;
        this.body.render.strokeStyle = this.body.completed ? this.disabledColor() : this.body.color;
    }

    PopBubble() {
        PlayPopSound();
        this.playLottieAnimation();

        if (!this.body.completed) {
            this.SetCompleted(true);
        }

        if (completedVisible) {

            new TaskBubble(RandomPosAroundCenter(1000), this.body.title, this.body.date, this.body.color, this.body.scale, this.body.completed, this.body.identifier);
        }

        Composite.remove(bubbleStack, [this.body]);
        Composite.remove(engine.world, [this.body]);

        SaveData();

    }

    playLottieAnimation() {
        const { x, y } = this.body.position;
        const animationWidth = 500;
        const animationHeight = 500;

        // Calculate the current scale factor similar to DrawText
        const scaleX = (initialBounds.width) / (render.bounds.max.x - render.bounds.min.x);
        const scaleY = (initialBounds.height) / (render.bounds.max.y - render.bounds.min.y);
        const scale = Math.min(scaleX, scaleY);

        // Calculate the scaled width and height based on the bubble size and renderer scale
        const scaledWidth = animationWidth * scale * this.body.scaler * ClusterScaler;
        const scaledHeight = animationHeight * scale * this.body.scaler * ClusterScaler;

        const animationContainer = document.createElement('div');
        animationContainer.style.position = 'absolute';

        // Adjust for the canvas offset and scale
        const adjustedX = (x - render.bounds.min.x) * scale - scaledWidth / 2;
        const adjustedY = (y - render.bounds.min.y) * scale - scaledHeight / 2;

        animationContainer.style.left = `${adjustedX}px`;
        animationContainer.style.top = `${adjustedY}px`;
        animationContainer.style.width = `${scaledWidth}px`;
        animationContainer.style.height = `${scaledHeight}px`;
        animationContainer.style.pointerEvents = 'none';
        document.body.appendChild(animationContainer);

        const animation = lottie.loadAnimation({
            container: animationContainer,
            renderer: 'svg',
            loop: false,
            autoplay: false,  // Changed to false, we'll play it manually after modifying
            path: 'Pop.json',
            rendererSettings: {
                preserveAspectRatio: 'xMidYMid slice'
            }
        });

        // Update the color of the animation elements
        animation.addEventListener('DOMLoaded', () => {
            const svg = animationContainer.querySelector('svg');
            const paths = svg.querySelectorAll('path');

            paths.forEach(path => {
                path.style.stroke = this.body.render.fillStyle;
            });

            // Play the animation after modifying
            animation.play();
        });

        animation.addEventListener('complete', function () {
            document.body.removeChild(animationContainer);
        });
    }

    DeleteBubble() {
        editedBubble = null;
        if (this.body.completed) {
            let index = completedBubbles.findIndex(bubble => bubble.identifier == this.body.identifier);

            if (index !== -1) {
                completedBubbles.splice(index, 1);
            }
        }
        Composite.remove(bubbleStack, [this.body]);
        SaveData();
        Composite.remove(engine.world, [this.body]);
    }

    SetScale(scale) {
        Body.scale(this.body, scale / this.body.scaler, scale / this.body.scaler);
        this.body.scaler = scale;
    }

    SetCompleted(completed) {

        console.log(completed);
        this.body.completed = completed;

        if (completed) {
            completedBubbles.push({
                title: this.body.title,
                date: this.body.date,
                color: this.body.color,
                scale: this.body.scaler,
                completed: this.body.completed,
                identifier: this.body.identifier
            });

            if (editedBubble != null) {
                ToggleCompletedTasks(true);
            }
        }
        else {
            let index = completedBubbles.findIndex(bubble => bubble.identifier == this.body.identifier);

            if (index !== -1) {
                completedBubbles.splice(index, 1);
            }

        }

        this.SetColor(this.body.color);
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


    DrawText() {
        this.DrawTitle();
        this.DrawDate();
    }

    DrawTitle() {
        var context = render.context;
        var pos = this.body.position;
        var area = this.body.area;

        // Calculate the current scale factor
        const scaleX = (initialBounds.width) / (render.bounds.max.x - render.bounds.min.x);
        const scaleY = (initialBounds.height) / (render.bounds.max.y - render.bounds.min.y);
        const scale = Math.min(scaleX, scaleY);

        var fontSize = Math.sqrt(area / this.body.title.length) * 0.5 * scale;

        context.fillStyle = '#fff'; // Text color
        context.font = "600 " + fontSize + "px Poppins"; // Text size and font
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        // Adjust position to account for zoom and pan
        const adjustedPosX = (pos.x - render.bounds.min.x) * scale;
        const adjustedPosY = (pos.y - render.bounds.min.y) * scale;

        let wrappedText = this.WrapText(context, this.body.title + (this.body.completed ? " ✔" : ""), adjustedPosX, adjustedPosY, Math.sqrt(this.body.area) * scale, fontSize, 3);
        let textHeight = wrappedText.length * fontSize;
        let startY = adjustedPosY - textHeight / 2 + fontSize / 2; // Adjust startY to center text vertically

        wrappedText.forEach(function (item, index) {
            context.fillText(item[0], item[1], startY + index * (textHeight / 2));
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
        if (this.body.date.length == '') return;
        var context = render.context;
        var area = this.body.area;

        // Calculate the current scale factor
        const scaleX = (initialBounds.width) / (render.bounds.max.x - render.bounds.min.x);
        const scaleY = (initialBounds.height) / (render.bounds.max.y - render.bounds.min.y);
        const scale = Math.min(scaleX, scaleY);

        var fontSize = Math.sqrt(area / this.body.date.length * 0.1) * scale;
        let pos = { x: this.body.position.x, y: this.body.position.y };

        context.fillStyle = '#fff';
        context.font = fontSize + 'px Poppins';
        context.textAlign = 'center';
        context.textBaseline = 'top';

        // Adjust position to account for zoom and pan
        const adjustedPosX = (pos.x - render.bounds.min.x) * scale;
        const adjustedPosY = (pos.y - render.bounds.min.y) * scale;

        let text = this.body.date.replaceAll("-", ".");
        let lines = text.split("T");
        // Draw each line separately
        for (let i = 0; i < lines.length; i++) {
            context.fillText(lines[i], adjustedPosX, adjustedPosY + fontSize * 3 + (i * fontSize * 1.2));
        }
    }
}