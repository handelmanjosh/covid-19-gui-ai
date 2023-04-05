import { useEffect } from 'react';
import { PersonController, Virus } from './components/Person';
import Graph from './components/Graph';
import { AreaController, Path } from './components/Area';

let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;
let people: PersonController;
let environment: AreaController;
const population = 100;
const myPath: {path: any, index: number, interval: any} = {path: null, index: 0, interval: null}
function App() {
  useEffect(() => {
      canvas = document.getElementById("canvas") as HTMLCanvasElement; 
      context = canvas.getContext("2d")!;
      canvas.height = 800;
      canvas.width = 800;
      const virus = new Virus(1, 1000, 5);
      people = new PersonController(canvas, context, virus);
      environment = new AreaController(16, canvas, context);
      people.gen(population);
      people.initInfection();
      requestAnimationFrame(frame);
  }, []);
  const frame = () => {
    resetCanvas();
    environment.draw();
    people.draw();
    people.infect();
    return; //bad, remove later
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
    const path = new Path(environment, [[0, 0], []], [[1, 1], []]);
    myPath.interval = setInterval(tempMoveAndDraw, 300)
    myPath.path = path.path;
  }
  const tempMoveAndDraw = () => {
    if (myPath.index >= myPath.path.length) {
      clearInterval(myPath.interval);
    } else {
      console.log(myPath.index);
      context.fillStyle = "red";
      const width = canvas.width / 16;
      console.log(myPath.path[myPath.index][0] * width, myPath.path[myPath.index][1] * width, width)
      context.fillRect(myPath.path[myPath.index][0] * width, myPath.path[myPath.index][1] * width, width, width);
      myPath.index++;
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
