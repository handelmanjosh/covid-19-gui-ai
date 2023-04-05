
export class AreaController {
    AreaList: Area[][];
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    constructor(num: number, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
        if (canvas.width !== canvas.height) throw new Error("Incorrect canvas dimensions");
        this.AreaList = [];
        this.canvas = canvas;
        this.context = context;
        //canvas must be square
        const delta = canvas.width / num;
        let count = 0;
        // a maze generation algorithm for blind people
        for (let r = 0; r < canvas.width; r+=delta) {
            const temp: Area[] = []
            for (let c = 0; c < canvas.height; c+=delta) {
                const area = new Area(r, c, delta, count % 2 !== 0)
                temp.push(area);
                count++;
            }
            this.AreaList.push(temp)
            //adds offset, makes maze more random
            count++;
        }
    }
    draw = () => {
        this.AreaList.forEach(areaList => areaList.forEach(area => area.draw(this.context)))
    }
}

export class Area {
    //represent areas with borders 
    SpaceList: Space[][];
    x: number;
    y: number;
    width: number;
    walls: [number, number, number, number];
    constructor(x: number, y: number, width: number, hasWalls: boolean) {
        this.SpaceList = [];
        this.x = x;
        this.y = y;
        this.width = width;
        for (let r = 0; r < width; r += 2) {
            const temp: Space[] = []
            for (let c = 0; c < width; c += 2) {
                const space = new Space(x + r, y + c);
                temp.push(space);
            }
            this.SpaceList.push(temp);
        }
        this.walls = [0, 0, 0, 0];
        if (hasWalls) {
            this.walls[Math.floor(Math.random() * 4)] = 1;
        }
    }
    draw = (context: CanvasRenderingContext2D) => {
        context.beginPath();
        context.strokeStyle = "black";
        context.moveTo(this.x, this.y);
        let movements: number[][] = [[this.x + this.width, this.y], [this.x+ this.width, this.y + this.width], [this.x, this.y + this.width], [this.x, this.y]]
        for (let i = 0; i < this.walls.length; i++) {
            if (this.walls[i] == 1) {
                context.lineTo(movements[i][0], movements[i][1]);
            } else {
                context.moveTo(movements[i][0], movements[i][1]);
            }
        }
        context.stroke();
        this.SpaceList.forEach(spaceList => spaceList.forEach(space => space.draw(context)));
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
        return;
        context.fillStyle = this.color
        context.fillRect(this.x, this.y, 2, 2);
    }
}
//ex: start: [[9, 8], [2, 2]]
//    end:   [[5, 6], [7, 7]]
//This means that the person starts in Space [2, 2] in Area [9, 8]
// and must move to Space [7, 7] in Area [5, 6]
export class Path {
    path: number[][][];
    index: number[];
    constructor(areaController: AreaController, start: number[][], end: number[][]) {

        this.path = []
        this.index = [0, 0];
        const areas: Area[][] = areaController.AreaList;
        const destinationX = end[0][0];
        const destinationY = end[0][1];
        const getAvailable = (path: number[][], full: number[][][]): number[][] => {
            const insideAll = (all: number[][][], a: number[]) => {
                for (const path of all) {
                    for (const location of path) {
                        if (location[0] === a[0] && location[1] === a[1]) {
                            return true;
                        }
                    }
                }
                return false;
            }

            const dir: ["posy", "negy", "negx", "posx"] = ["posy", "negy", "negx", "posx"];
            const options = [[0, 1], [0, -1], [-1, 0], [1, 0]];
            const currentPos = path[path.length - 1];
            const available: number[][] = []
            for (let i = 0; i < 4; i++) {
                const newPos = [currentPos[0] + options[i][0], currentPos[1] + options[i][1]];
                if (
                    !insideAll(full, newPos) && newPos[0] > -1 && newPos[0] < areas.length 
                    && newPos[1] > -1 && newPos[1] < areas.length 
                    && canMove(areas[currentPos[0]][currentPos[1]], areas[newPos[0]][newPos[1]], dir[i])
                    ) {
                    available.push(newPos);
                }   
            }
            return available
        }
        let currentPaths: number[][][] = [[[start[0][0], start[0][1]]], ];
        let done = false;
        let correctPath = undefined;
        while (!done) {
            const newCurrentPaths = [];
            console.log(currentPaths);
            for (const path of currentPaths) {
                if (path[path.length - 1][0] === destinationX && path[path.length - 1][1] === destinationY) {
                    correctPath = path;
                    done = true;
                }
                const available: number[][] = getAvailable(path, currentPaths);
                for (const option of available) {
                    const newPath = copy(path);
                    newPath.push(option);
                    newCurrentPaths.push(newPath);
                }
            }
            currentPaths = newCurrentPaths;
        }
        
        correctPath = correctPath as number[][];
        const indexAreasByPath = (n: number[]) => areas[n[0]][n[1]]
        const startMiniArea = start[1];
        const endMiniArea = end[1];
        for (let i = 0; i < correctPath.length; i++) {
            if (i === 0) {
                const dir = getDirection(indexAreasByPath(correctPath[i]), indexAreasByPath(correctPath[i+1]));
                const destination = getRandomPositionInArea(indexAreasByPath(correctPath[i+1]), dir);
                const miniPath = getMiniPath(startMiniArea, destination, dir)
            } else if (i === correctPath.length - 2) {

            } else if (i === correctPath.length - 1) {
                continue;
            } else {

            }
        }
    }
    next = () => {
        this.index[1]++;
        if (this.index[1] >= this.path[0].length) {
            this.index[1] = 0;
            this.index[0]++;
        }
        if (this.index[0] > this.path.length) {
            return false;
        }
        return true;
    }
    current = () => {
        return this.path[this.index[0]][this.index[1]]
    }
}
//movement logic. Alternate going closer on both axes. If can't move on one axis, try other, if both can't, try opposite
//There's always a way, so alg will eventually make it
const canMove = (a1: Area, a2: Area, direction: "posy" | "negy" | "negx" | "posx"): boolean => {
    if (direction === "posy") {
        if (a1.walls[2] === 0 && a2.walls[0] === 0) {
            return true;
        }
    } else if (direction === "negy") {
        if (a1.walls[0] === 0 && a2.walls[2] === 0) {
            return true;
        }
    } else if (direction === "posx") {
        if (a1.walls[1] === 0 && a2.walls[3] === 0) {
            return true;
        }
    } else {
        if (a1.walls[3] === 0 && a2.walls[1] === 0) {
            return true;
        }
    }
    return false;
}
//Where do we want the position in the new area?
const getDirection = (area1: Area, area2: Area): "top" | "bottom" | "right" | "left" => {
    let xDiff = Math.floor(area2.x - area1.x);
    let yDiff = Math.floor(area2.y - area1.y);
    if (xDiff > 0) return "left";
    if (xDiff < 0) return "right";
    if (yDiff > 0) return "top";
    if (yDiff < 0) return "bottom";


    console.error("oops");
    return "top";

}
const getRandomPositionInArea = (area: Area, position: "top" | "bottom" | "right" | "left"): number[] => {
    if (position === "top") {
        
    } else if (position === "bottom") {

    } else if (position === "left") {

    } else {

    }
}
const getMiniPath = (start: number[], end: number[], position: "top" | "bottom" | "right" | "left") => {
    
}
const copy = (a: any[]): any[] => {
    const result: any[] = []
    for (const item of a) {
        result.push(item);
    }
    return result;
}