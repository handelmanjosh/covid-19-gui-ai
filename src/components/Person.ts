
export class Virus {
    infectivity: number; // chance one infected has to infect a susceptible it was in contact with
    recoveryTime: number; // days until infected is recovered
    startedInfected: number;
    constructor(infectivity: number, recoveryTime: number, startedInfected: number) {
        this.infectivity = infectivity;
        this.recoveryTime = recoveryTime;
        this.startedInfected = startedInfected;
    }
}
export class PersonController {
    PersonList: Person[];
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    infectivity: number;
    Virus: Virus;
    constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, virus: Virus) {
        this.PersonList = [];
        this.canvas = canvas;
        this.context = context;
        this.infectivity = 10;
        this.Virus = virus;
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
    initInfection = () => {
        for (let i = 0; i < this.Virus.startedInfected; i++) {
            this.PersonList[i].state = "i";
            this.PersonList[i].recoveryTime = this.Virus.recoveryTime;
        }
    }
    infect = () => {
        this.PersonList.forEach(person1 => {
            if (person1.state === "i") {
                this.PersonList.forEach(person2 => {
                    if (person2.state === "s" && personDistance(person1, person2) < person1.radius) {
                        const rnum = Math.random();
                        if (rnum < this.Virus.infectivity) {
                            person2.state = "i";
                            person2.recoveryTime = this.Virus.recoveryTime;
                        }
                    }   
                });
            }

        });
    }
}
const personDistance = (p1: Person, p2: Person) => {
    return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
}

export default class Person {
    x: number;
    y: number;
    radius: number;
    state: "s" | "i" | "r";
    context: CanvasRenderingContext2D;
    canvasWidth: number;
    canvasHeight: number;
    recoveryTime: number | undefined;
    constructor(x: number, y: number, vMax: number, context: CanvasRenderingContext2D, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.canvasHeight = height;
        this.canvasWidth = width;
        this.state = "s";
        this.radius = 2;
        this.context = context;
    }   
    draw = () => {
        this.move();
        let color = (this.state === "s") ? "blue" : (this.state === "r") ? "green" : "red";
        this.context.beginPath();
        this.context.fillStyle = color;
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.context.fill();
    }
    move = () => {
        if (this.recoveryTime !== undefined) {
            if (this.recoveryTime > 0) {
                this.recoveryTime--;
            } else {
                this.state = "r";
                this.recoveryTime = undefined;
                
            }
        }
    }
}


const randomBetween = (a: number, b: number) => {
    return a + (Math.random() * (b - a))
}