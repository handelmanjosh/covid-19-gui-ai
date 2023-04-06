import { AreaController, Schedule } from "./Area";
export class Virus {
    infectivity: number; // chance one infected has to infect a susceptible it was in contact with
    recoveryTime: number; // days until infected is recovered
    startedInfected: number;
    constructor(infectivity: number, recoveryTime: number, startedInfected: number) {
        if (infectivity > 1 || infectivity < 0) throw new Error("Invalid Infectivity");
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
    public contactRate: number;
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
        this.contactRate = 0;
    }
    draw = () => {
        this.PersonList.forEach(person => person.draw(this.context));
        this.infectAll();
    }
    infectAll = () => {
        let contacts = 0;
        this.PersonList.forEach(person1 => {
            this.PersonList.forEach(person2 => {
                if (person1 !== person2) {
                    if (person1.infect(person2)) {
                        //people were in contact and person1 was infected
                        contacts++;
                        const r = Math.random();
                        if (r < this.Virus.infectivity * (1 - person1.maskCoefficient)) {
                            person2.becomeInfected(this.Virus);
                        }
                    }
                }
            });
        });
        this.contactRate = contacts / this.PersonList.length;
    }
    init = () => {
        this.PersonList.sort(() => Math.random() - 0.5) 
        for (let i = 0; i < this.Virus.startedInfected; i++) {
            this.PersonList[i].becomeInfected(this.Virus);
        }
    }
}


export default class Person {
    radius: number;
    state: "s" | "i" | "r";
    schedule: Schedule;
    recoveryTime: number | undefined;
    width: number;
    time: number;
    miniMoved: number[][];
    setLeftOverTime: boolean;
    leftOverTime: number;
    moveTime: number;
    reversed: boolean;
    maskCoefficient: number;
    lockdown: boolean;
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
        this.miniMoved = [];
        this.setLeftOverTime = false;
        this.reversed = false;
        this.leftOverTime = 0;
        this.moveTime = 0;
        this.maskCoefficient = 0;
        this.lockdown = false;
    }   
    infect = (p: Person): boolean => {
        if (this.state !== "i" || p.state !== "s" || personDistance(this, p) > this.radius) {
            return false;
        } else {
            return true;
        }
    }
    becomeInfected = (virus: Virus) => {
        this.state = "i";
        this.recoveryTime = virus.recoveryTime;
    }
    draw = (context: CanvasRenderingContext2D) => {
        if (!this.lockdown) {
            this.move();
        }
        this.updateFrame();
        let color = (this.state === "s") ? "blue" : (this.state === "r") ? "green" : "red";
        context.beginPath();
        context.fillStyle = color;
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        context.fill();
    }
    updateFrame = () => {
        this.time++;
        if (this.recoveryTime !== undefined) {
            if (this.recoveryTime <= 0 && this.state === "i") {
                this.state = "r";
                this.recoveryTime = undefined;
            } else {
                this.recoveryTime--;
            }
        }
    }
    move = () => {
        const nextLocation = this.schedule.next();
        if (nextLocation) {
            const big = nextLocation[0];
            const mini = nextLocation[1];
            this.x = (big[0] * this.width) + (mini[0] * 2) + 1;
            this.y = (big[1] * this.width) + (mini[1] * 2) + 1;
        } else {
            if (!this.setLeftOverTime) {
                this.setLeftOverTime = true;
                this.leftOverTime = 1000 - this.time;
                this.moveTime = 0;
                this.reversed = false;
            }
            this.miniMove();
            if (this.time >= 1000) {
                const value = this.schedule.nextIndex();
                this.setLeftOverTime = false;
                this.time = 0;
                if (!value) {
                    //ended the schedule;
                    this.schedule.reset();
                }
            }
        }
    }
    miniMove = () => {
        if (this.moveTime === Math.floor(this.leftOverTime / 2)) {
            this.reversed = true;
            this.miniMoved.reverse();
        }
        if (!this.reversed) {
            const moveX = (Math.random() > 0.5) ? 0.5 : -0.5;
            const moveY = (Math.random() > 0.5) ? 0.5 : -0.5;
            this.x += moveX;
            this.y += moveY;
            this.miniMoved.push([moveX, moveY]);
        } else {
            const current = this.miniMoved[0];
            if (current) {
                this.x -= current[0];
                this.y -= current[1];
                this.miniMoved.splice(0, 1);
            }
        }
        this.moveTime++;
    }
}
const personDistance = (p1: Person, p2: Person) => {
    return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
}