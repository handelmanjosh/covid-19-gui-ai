import PF from 'pathfinding'


const miniPath: number[][] = [];

type Direction = "top" | "bottom" | "left" | "right";
type AreaRole = "work" | "social" | "housing" | "shopping" | "none";
type ScaledOption<T> = [T, number][]
type Maybe<T> = T | null;
const housingOptions: ScaledOption<AreaRole> = [["work", 100], ["social", 50], ["housing", 75], ["shopping", 31]];
const housingColors: {work: string, social: string, housing: string, shopping: string, none: string} = {work: "orange", social: "cyan", housing: "gray", shopping: "magenta", none: "red"}


export class AreaController {
    AreaList: Area[][];
    Obstacles: number[][];
    OrganizedAreaList: {work: Area[], social: Area[], housing: Area[], shopping: Area[]};
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    constructor(num: number, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
        //canvas must be square
        if (canvas.width !== canvas.height) throw new Error("Incorrect canvas dimensions");
        this.AreaList = [];
        this.Obstacles = [];
        this.OrganizedAreaList = {work: [], social: [], housing: [], shopping: []}
        this.canvas = canvas;
        this.context = context;
        
        const delta = canvas.width / num;
        let count = 0;

        // a maze generation algorithm for blind people
        for (let r = 0; r < canvas.height; r+=delta) {
            const temp: Area[] = []
            for (let c = 0; c < canvas.width; c+=delta) {
                const area = new Area(c, r, delta, count % 2 !== 0, getRandomScaledOption(housingOptions))
                temp.push(area);
                count++;
            }
            this.AreaList.push(temp)
            //adds offset, makes maze more random
            count++;
        }
        for (let i = 0; i < delta; i+=2) {
            const temp = [];
            for (let ii = 0; ii < delta; ii+=2) {
                temp.push(0);
            }
            miniPath.push(temp);
        }
        this.createObstacles();
        this.organizeAreas();
    }
    createObstacles = () => {
        //DOUBLE BOTH
        //for horizontal row and for tops of areas
        for (let i = 0; i < this.AreaList.length; i++) {
            const areaList = this.AreaList[i];
            const lowerAreaList = (i+1 === this.AreaList.length) ? null : this.AreaList[i+1];
            const temp1: number[] = []
            for (let ii = 0; ii < areaList.length - 1; ii++) {
                const area = areaList[ii];
                const nextArea = areaList[ii+1];
                temp1.push(0);
                if (area.walls[1] === 1 || nextArea.walls[3] === 1) {
                    temp1.push(1);
                } else {
                    temp1.push(0);
                }
            }
            temp1.push(0);
            this.Obstacles.push(temp1);
            if (lowerAreaList != null) {
                const temp2: number[] = [];
                let index = 0;
                for (let ii = 0; ii < temp1.length; ii++) {
                    if (ii % 2 === 0) {
                        const area = areaList[index];
                        const areaBelow = lowerAreaList[index];
                        if (area.walls[2] === 1 || areaBelow.walls[0] === 1) {
                            temp2.push(1);
                        } else {
                            temp2.push(0);
                        }
                        index++;
                    } else {
                        temp2.push(1);
                    }
                }
                this.Obstacles.push(temp2);
            }
        }
    }
    organizeAreas = () => {
        console.log("organize areas called");
        let i = 0
        for (const areaList of this.AreaList) {
            let ii = 0;
            for (const area of areaList) {
                if (!checkArea(area, this.AreaList, ii, i)) area.type = "none";
                if (area.type !== "none") {
                    this.OrganizedAreaList[area.type].push(area);
                }
                ii++;
            }
            i++;
        }
    }
    draw = () => {
        this.AreaList.forEach((areaList) => areaList.forEach((area) => area.draw(this.context)))
    }
}

const checkArea = (a: Area, areaList: Area[][], x: number, y: number): boolean => {
    
    let leftArea: Maybe<Area> = (x - 1 > -1) ? areaList[y][x - 1] : null;
    let rightArea: Maybe<Area> = (x + 1 < areaList[0].length) ? areaList[y][x + 1] : null;
    let topArea: Maybe<Area> = (y - 1 > -1) ? areaList[y - 1][x] : null;
    let bottomArea: Maybe<Area> = (y + 1 < areaList.length) ? areaList[y + 1][x] : null;

    if (leftArea) {
        if (a.walls[3] === 0 && leftArea.walls[1] === 0) {
            return true;
        }
    }
    if (rightArea) {
        if (a.walls[1] === 0 && rightArea.walls[3] === 0) {
            return true;
        }
    }
    if (bottomArea) {
        if (a.walls[2] === 0 && bottomArea.walls[0] === 0) {
            return true;
        }
    }
    if (topArea) {
        if (a.walls[0] === 0 && topArea.walls[3] === 0) {
            return true;
        }
    }
    return false;
}
const getRandomScaledOption = (option: ScaledOption<any>) : any => {    
    const index = Math.floor(Math.random() * option.length);
    option[index][1]--;
    const result =  option[index][0]
    if (option[index][1] === 0) {
        option.splice(index, 1);
    }
    return result;
}
export class Area {
    //represent areas with borders 
    SpaceList: Space[][];
    x: number;
    y: number;
    width: number;
    walls: [number, number, number, number];
    type: AreaRole;
    constructor(x: number, y: number, width: number, hasWalls: boolean, type: AreaRole) {
        this.SpaceList = [];
        this.x = x;
        this.y = y;
        this.width = width;
        for (let r = 0; r < width; r += 2) {
            const temp: Space[] = []
            for (let c = 0; c < width; c += 2) {
                const space = new Space(x + c, y + r);
                temp.push(space);
            }
            this.SpaceList.push(temp);
        }
        this.walls = [0, 0, 0, 0];
        if (hasWalls) {
            this.walls[Math.floor(Math.random() * 4)] = 1;
        }
        this.type = type;
    }
    draw = (context: CanvasRenderingContext2D) => {
        context.fillStyle = housingColors[this.type];
        context.fillRect(this.x, this.y, this.width, this.width);
        context.beginPath();
        context.strokeStyle = "black"
        context.lineWidth = 5;
        context.moveTo(this.x, this.y);
        let movements: number[][] = [[this.x + this.width, this.y], [this.x + this.width, this.y + this.width], [this.x, this.y + this.width], [this.x, this.y]]
        for (let i = 0; i < this.walls.length; i++) {
            if (this.walls[i] === 1) {
                context.lineTo(movements[i][0], movements[i][1]);
            } else {
                context.moveTo(movements[i][0], movements[i][1]);
            }
        }
        context.stroke();
    }
}
const color = ['blue', 'red', 'orange', 'black', 'white', 'gray', 'green', 'cyan', 'magenta']
export class Space {
    //represent spaces within areas. 2x2;
    x: number;
    y: number;
    color: string;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.color = color[Math.floor(Math.random() * color.length)];
    }
    draw = (context: CanvasRenderingContext2D) => {

    }
}
const scheduleParams: ScaledOption<AreaRole> = [["housing" , 3], ["shopping", 1], ["social", 3], ["work", 5]]
export class Schedule {
    PathList: Path[];
    index: number;
    constructor(areaController: AreaController) {
        this.PathList = [];
        this.index = 0;
    }
    next = (): number[][] | null => {
        const n = this.PathList[this.index].next();
        if (n == null) {
            this.index++;
            return null;
        } else {
            return n;
        }
    }
}


//ex: start: [[9, 8], [2, 2]]
//    end:   [[5, 6], [7, 7]]
//This means that the person starts in Space [2, 2] in Area [9, 8]
// and must move to Space [7, 7] in Area [5, 6]
export class Path {
    path: number[][][];
    index: number;
    constructor(areaController: AreaController, start: number[][], end: number[][]) {
        this.path = []
        this.index = 0;

        const obstacles = areaController.Obstacles;

        const pathFindingGrid = new PF.Grid(obstacles[0].length, obstacles.length);

        // Set the walls in the grid
        for (let y = 0; y < obstacles.length; y++) {
            for (let x = 0; x < obstacles[y].length; x++) {
                if (obstacles[y][x] === 1) {
                    pathFindingGrid.setWalkableAt(x, y, false);
                }
            }
        }
        const startX = start[0][0] * 2;
        const startY = start[0][1] * 2;
        const endX = end[0][0] * 2;
        const endY = end[0][1] * 2;

        const finder = new PF.AStarFinder();
        //generate big path
        const path = finder.findPath(startX, startY, endX, endY, pathFindingGrid);
        const finalPath = path.map((value: number[]) => {
            return [Math.floor(value[0] / 2), Math.floor(value[1] / 2)];
        });
        const simplifiedPath: number[][] = [];
        for (let i = 0; i < finalPath.length; i++) {
            if (i % 2 === 0 || i === finalPath.length - 1) {
                simplifiedPath.push(finalPath[i]);
            } 
        }
        
        //generate mini path for each big path
        let prevLocation: number[] = start[1];
        const finalDestination: number[] = end[1];
        for (let i = 0; i < simplifiedPath.length; i++) {
            const location = simplifiedPath[i];
            const nextLocation = simplifiedPath[i+1];
            let dir: Direction;
            let destination: number[];
            let path: number[][]
            if (nextLocation) {
                dir = getDirection(location, nextLocation);
                destination = getPointOnSide(dir);
                if (i === 0) {
                    path = getMiniPath(prevLocation, destination);
                } else {
                    path = getMiniPath(prevLocation, destination)
                }
                prevLocation = rollOver(destination, dir);
                path.push(prevLocation);
            } else {
                path = getMiniPath(prevLocation, finalDestination);
            }
            
            if (nextLocation) {
                for (let i = 0; i < path.length - 1; i++) {
                    this.path.push([location, path[i]])
                }
                this.path.push([nextLocation, path[path.length - 1]]);
            } else {
                for (let i = 0; i < path.length; i++) {
                    this.path.push([location, path[i]]);
                }
            }
        }
        console.log(this.path);
    }
    next = (): number[][] | null => {
        if (this.index >= this.path.length) {
            return null;
        } else {
            const c = this.path[this.index];
            this.index++;
            return c;
        }
    }
}


const rollOver = (prev: number[], dir: Direction): number[] => {
    const e = miniPath.length - 1;
    if (dir === "left") {
        return [e, prev[1]];
    } else if (dir === "right") {
        return [0, prev[1]];
    } else if (dir === "top") {
        return [prev[0], e];
    } else {
        return [prev[0], 0];
    }
}
const getPointOnSide = (dir: Direction): number[] => {
    const e = miniPath.length - 1;
    const r = Math.floor(Math.random() * e)
    if (dir === "left") {
        return [0, r];
    } else if (dir === "right") {
        return [e, r]
    } else if (dir === "top") {
        return [r, 0]
    } else {
        return [r, e];
    }
}
const getDirection = (a1: number[], a2: number[]): Direction => {
    let xDiff = a2[0] - a1[0];
    let yDiff = a2[1] - a1[1];

    if (xDiff > 0) return "right";
    if (xDiff < 0) return "left";
    if (yDiff > 0) return "bottom";
    if (yDiff < 0) return "top";

    console.error("oops");
    return "top";
}

const getMiniPath = (start: number[], end: number[]): number[][] => {
    
    const pathFindingGrid = new PF.Grid(miniPath[0].length, miniPath.length);
    const [startX, startY] = start;
    const [endX, endY] = end;
    const finder = new PF.AStarFinder();
    const path = finder.findPath(startX, startY, endX, endY, pathFindingGrid);

    return path;
}   
