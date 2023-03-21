
export class PersonController {
    PersonList: Person[];
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    infectivity: number;
    constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
        this.PersonList = [];
        this.canvas = canvas;
        this.context = context;
        this.infectivity = 10;
    }
    draw = () => {
        this.PersonList.forEach(person => {
            person.draw();
        })
    }
    gen = (n: number) => {
        for (let i = 0; i < n; i++) {
            let p = new Person(randomBetween(0, this.canvas.width), randomBetween(0, this.canvas.height), 10, this.context, this.canvas.width, this.canvas.height);
            this.PersonList.push(p);
        }
    }
    initInfection = (n: number) => {
        for (let i = 0; i < n; i++) {
            this.PersonList[i].state = "i";
        }
    }
    infect = () => {
        this.PersonList.forEach(person1 => {
            if (person1.state === "i") {
                 this.PersonList.forEach(person2 => {
                    let num = Math.random() * 100;
                    if (num < this.infectivity) {
                        person2.state = "i";
                    }
                });
            }

        });
    }
}

export default class Person {
    x: number;
    y: number;
    vx: number;
    vy: number;
    state: "s" | "i" | "r";
    context: CanvasRenderingContext2D;
    canvasWidth: number;
    canvasHeight: number;
    constructor(x: number, y: number, vMax: number, context: CanvasRenderingContext2D, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(Math.random() * 2 * Math.PI) * vMax;
        this.vy = Math.sin(Math.random() * 2 * Math.PI) * vMax;
        this.canvasHeight = height;
        this.canvasWidth = width;
        this.state = "s";
        this.context = context;
    }   
    draw = () => {
        this.move();
        let color = (this.state === "s") ? "blue" : (this.state === "r") ? "green" : "red";
        this.context.beginPath();
        this.context.fillStyle = color;
        this.context.arc(this.x, this.y, 4, 0, 2 * Math.PI);
        this.context.fill();
    }
    move = () => {
        this.x += this.vx;
        this.y += this.vy;
        this.checkBounding();
    }
    checkBounding = () => {
        if (this.x > this.canvasWidth) {
            this.vx = negative(this.vx);
        }
        if (this.y > this.canvasHeight) {
            this.vy = negative(this.vy);
        }
        if (this.x < 0) {
            this.vx = positive(this.vx);
        }
        if (this.y < 0) {
            this.vy = positive(this.vy);
        }
    }
}

const negative = (n: number) => {
    return (n > 0) ? -1 * n : n;
}
const positive = (n: number) => {
    return (n > 0) ? n : -1 * n;
}
const randomBetween = (a: number, b: number) => {
    return a + (Math.random() * (b - a))
}