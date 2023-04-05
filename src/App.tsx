import { useEffect } from 'react';
import { PersonController, Virus } from './components/Person';
import Graph from './components/Graph';
import { AreaController, Path, Schedule } from './components/Area';

let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;
let people: PersonController;
let environment: AreaController;
let ran = 0;
const population = 100;
const mySchedule: {schedule: Schedule | null, interval: any, time: number} = {schedule: null, interval: null, time: 0}
function App() {
  useEffect(() => {
      if (ran === 1) return;
      canvas = document.getElementById("canvas") as HTMLCanvasElement; 
      context = canvas.getContext("2d")!;
      canvas.height = 800;
      canvas.width = 800;
      const virus = new Virus(1, 1000, 5);
      environment = new AreaController(16, canvas, context);
      people = new PersonController(10, environment, virus, canvas, context);
      requestAnimationFrame(frame);
      ran++;
  }, []);
  const frame = () => {
    resetCanvas();
    environment.draw();
    people.draw();
    requestAnimationFrame(frame);
  }
  const resetCanvas = () => {
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  const getSusceptibles = () => {
    let total = 0;
    if (people) {
      people.PersonList.forEach(person => {
        if (person.state === "s") total++;
      });
    }
    return total;
  }
  const getInfected = () => {
    let total = 0;
    if (people) {
      people.PersonList.forEach(person => {
        if (person.state === "i") total++;
      });
    }
    return total;
  }
  const getRecovered = () => {
    let total = 0;
    if (people) {
      people.PersonList.forEach(person => {
        if (person.state === "r") total++;
      });
    }
    return total;
  }
  
  const click = () => {
    const schedule = new Schedule(environment);
    console.log("clicked");
    console.log(schedule.PathList);
    mySchedule.schedule = schedule
    mySchedule.time = 0;
    mySchedule.interval = setInterval(tempMoveAndDraw, 20);
  }
  const tempMoveAndDraw = () => {
    const next = mySchedule.schedule?.next();
    console.log(mySchedule.time);
    mySchedule.time++;
    if (next) {
      const location = next;
      const width = canvas.width / 16;
      const big = location[0];
      const mini = location[1];
      context.fillStyle = "red";
      context.fillRect(big[0] * width + mini[0] * 2, big[1] * width + mini[1] * 2, 2, 2);
    } else {
      if (mySchedule.time >= 1000) {
        mySchedule.time = 0;
        const value = mySchedule.schedule?.nextIndex();
        if (!value) {
          clearInterval(mySchedule.interval);
        }
      }

    }
  }

  return (
    <div className="flex flex-col justify-center items-center h-[100vh]"> 
      <div className="flex flex-row gap-4 items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-1">
          <Graph title="Susceptibles" color="blue" getParameter={getSusceptibles} max={population} min={0} />
          <Graph title="Infected" color="red" getParameter={getInfected} max={population} min={0} />
          <Graph title="Recovered" color="green" getParameter={getRecovered} max={population} min={0} />
        </div>
        <canvas className="border-black border-2" id="canvas" />
      </div>
      <button className="active:bg-blue-600" onClick={click}>Click me</button>
    </div>
  );
}

export default App;
