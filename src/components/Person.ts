import { Path, AreaController, Area, Space, Schedule } from "./Area";
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
    AreaController!: AreaController;
    constructor() {
        this.PersonList = [];
    }
}


export default class Person {
    radius: number;
    state: "s" | "i" | "r";
    schedule: Schedule
    recoveryTime: number | undefined;
    constructor(areaController: AreaController) {
        this.state = "s";
        this.radius = 2;
        this.schedule = new Schedule(areaController);
    }   
    draw = (context: CanvasRenderingContext2D) => {
        this.move();
        let color = (this.state === "s") ? "blue" : (this.state === "r") ? "green" : "red";
        context.beginPath();
        context.fillStyle = color;
        //context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        context.fill();
    }
    move = () => {

    }
}


const randomBetween = (a: number, b: number): number => {
    return a + (Math.random() * (b - a))
}