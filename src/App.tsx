import { useEffect, useState } from 'react';
import { PersonController, Virus } from './components/Person';
import Graph from './components/Graph';
import { AreaController, Path, Schedule } from './components/Area';
import SingleButton from './components/SingleButton';
import ControlMethodController from './components/ControlMethodController';
import ControlMethod from './components/ControlMethod';
import ValueChanger from './components/ValueChanger';

let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;
let people: PersonController;
let environment: AreaController;
let virus: Virus;
let ran = 0;
const population = 500;
const params: {started: boolean, time: number, maskCoefficient: number} = {started: false, time: 0, maskCoefficient: 0}
function App() {
  const [started, setStarted] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);
  useEffect(() => {
      if (ran === 1) return;
      canvas = document.getElementById("canvas") as HTMLCanvasElement; 
      context = canvas.getContext("2d")!;
      canvas.height = 800;
      canvas.width = 800;
      //each time step is 1/1000 of a period, there are 12 periods in each day. So 12,000 time steps is one day
      virus = new Virus(0.05, 12000, 5);
      environment = new AreaController(16, canvas, context);
      people = new PersonController(population, environment, virus, canvas, context);
      setLoaded(true);
      requestAnimationFrame(frame)
      ran++;
  }, []);
  const start = () => {
    setStarted(true);
    params.time = 0;
    params.started = true;
    people.init();
  }
  const reset = () => {
    setStarted(false);
    setLoaded(false);
    params.started = false;
    virus = new Virus(.05, 12000, 5);
    environment = new AreaController(16, canvas, context);
    people = new PersonController(population, environment, virus, canvas, context);
    setLoaded(true);
  }
  const frame = () => {
    resetCanvas();
    environment.draw();
    if (params.started) {
      people.draw();
      params.time++;
      setTime(params.time);
    }  
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
  const getContactRate = () => {
    const rate = people?.contactRate;
    return rate ?? 0;
  }
  const enableMasking = () => {
    console.log(params.maskCoefficient);
    people.PersonList.forEach(person => person.maskCoefficient = params.maskCoefficient);
  }
  const removeMasking = () => {
    people.PersonList.forEach(person => person.maskCoefficient = 0);
  }
  const enableLockdown = () => {
    people.PersonList.forEach(person => person.lockdown = true)
  }
  const disableLockdown = () => {
    people.PersonList.forEach(person => person.lockdown = false);
  }
  const changeMaskCoefficient = (n: number) => {
    params.maskCoefficient = n;
  }
  return (
    <div className="flex flex-col justify-center items-center gap-4 h-[100vh]">
      <p className="text-center text-xl font-bold">{`Time: ${time}`}</p> 
      <div className="flex flex-row gap-4 items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <Graph title="Susceptibles" color="blue" getParameter={getSusceptibles} max={population} min={0} />
          <Graph title="Infected" color="red" getParameter={getInfected} max={population} min={0} />
          <Graph title="Recovered" color="green" getParameter={getRecovered} max={population} min={0} />
          <Graph title="Contact Rate" color="orange" getParameter={getContactRate} max={1} min={0} />
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
          <canvas className="border-black border-2" id="canvas" />
          <div className="flex flex-row items-center justify-center">
            {(started || !loaded) ? <></> : <SingleButton click={start} text="Start" />}
            {started && loaded ? <SingleButton click={reset} text="Reset" /> : <></>}
          </div>
        </div>
        <div className="flex flex-col justify-center items-center gap-4">
          <ControlMethod name="Masking" apply={enableMasking} remove={removeMasking} />
          <ControlMethod name="Lockdown" apply={enableLockdown} remove={disableLockdown} />
        </div>
      </div>
      <div className="flex flex-row justify-center items-center gap-4">
        <ValueChanger 
          changeTarget={changeMaskCoefficient} 
          name="Mask Coefficient: (% reduction in virus infectivity)" 
          max={1}
          min={0}
          step={0.01}
        />
      </div>
    </div>
  );
}

export default App;
