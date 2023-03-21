import { useEffect, useRef } from 'react';
import './App.css';
import Person, { PersonController } from './components/Person';
import Graph from './components/Graph';

let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;
let people: PersonController;
const population = 100;
function App() {
  useEffect(() => {
      canvas = document.getElementById("canvas") as HTMLCanvasElement; 
      context = canvas.getContext("2d")!;
      canvas.height = 800;
      canvas.width = 800;
      people = new PersonController(canvas, context);
      people.gen(population);
      people.initInfection(3);
      requestAnimationFrame(frame);
  }, []);
  const frame = () => {
    resetCanvas();
    people.draw();
    people.infect(); //bad, remove later
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
  return (
    <div className="flex flex-col justify-center items-center"> 
      <div className="flex flex-row gap-4 items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-1">
          <Graph title="Susceptibles" color="green" getParameter={getSusceptibles} max={population} min={0} />
          <Graph title="Infected" color="red" getParameter={getInfected} max={population} min={0} />
          <Graph title="Recovered" color="blue" getParameter={getRecovered} max={population} min={0} />
        </div>
        <canvas className="border-black border-2" id="canvas" />
      </div>
    </div>
  );
}

export default App;
