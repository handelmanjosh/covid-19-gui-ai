import { AreaController, Schedule } from "./Area";
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
    AreaController: AreaController;
    Virus: Virus;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    constructor(n: number, areaController: AreaController, virus: Virus, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
        this.PersonList = [];
        this.canvas = canvas;
        this.context = context;
        this.Virus = virus;
        this.AreaController = areaController;
        for (let i = 0; i < n; i++) {
            const person = new Person(areaController, areaController.delta);
            this.PersonList.push(person);
        }
    }
    draw = () => {
        this.PersonList.forEach(person => person.draw(this.context));
    }
}


export default class Person {
    radius: number;
    state: "s" | "i" | "r";
    schedule: Schedule
    recoveryTime: number | undefined;
    width: number
    time: number
    x: number;
    y: number;
    constructor(areaController: AreaController, width: number) {
        this.time = 0;
        this.state = "s";
        this.radius = 4;
        this.schedule = new Schedule(areaController);
        this.x = 0;
        this.y = 0;
        this.width = width;

    }   
    draw = (context: CanvasRenderingContext2D) => {
        this.move();
        let color = (this.state === "s") ? "blue" : (this.state === "r") ? "green" : "red";
        context.beginPath();
        context.fillStyle = color;
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        context.fill();
    }
    move = () => {
        this.time++;
        const nextLocation = this.schedule.next();
        if (nextLocation) {
            const big = nextLocation[0];
            const mini = nextLocation[1];
            this.x = (big[0] * this.width) + (mini[0] * 2) + 1;
            this.y = (big[1] * this.width) + (mini[1] * 2) + 1;
        } else {
            if (this.time >= 1000) {
                const value = this.schedule.nextIndex();
                if (!value) {
                    //ended the schedule;
                    this.schedule.reset();
                }
            }
        }
    }
}
