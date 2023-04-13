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
const params: 
  {
    started: boolean, 
    time: number, 
    maskCoefficient: number, 
    population: number,
    startedInfected: number,
    infectivity: number,
    recoveryTime: number,
  } = 
  {
    started: false, 
    time: 0, 
    maskCoefficient: 0, 
    population: 10,
    startedInfected: 5,
    recoveryTime: 12000,
    infectivity: 0.05,
  }
function App() {
  const [started, setStarted] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);
  const [population, setPopulation] = useState<number>(10);
  useEffect(() => {
      if (ran === 1) return;
      canvas = document.getElementById("canvas") as HTMLCanvasElement; 
      context = canvas.getContext("2d")!;
      canvas.height = 800;
      canvas.width = 800;
      //each time step is 1/1000 of a period, there are 12 periods in each day. So 12,000 time steps is one day
      environment = new AreaController(16, canvas, context);
      virus = new Virus(params.infectivity, params.recoveryTime, params.startedInfected);
      people = new PersonController(params.population, environment, virus, canvas, context);
      setLoaded(true);
      requestAnimationFrame(frame)
      ran++;
  }, []);
  const start = () => {
    virus = new Virus(params.infectivity, params.recoveryTime, params.startedInfected);
    people = new PersonController(params.population, environment, virus, canvas, context);
    setStarted(true);
    params.time = 0;
    params.started = true;
    people.init();
  }
  const reset = () => {
    setStarted(false);
    setLoaded(false);
    params.started = false;
    environment = new AreaController(16, canvas, context);
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
    
    if (!rate) {
      return 0;
    } else {
      let total: number = 0;
      for (const contact of rate) {
        total += contact
      }
      return total ?? 0;
    }
  }
  const getInfectRate = () => {
    const rate = people?.infectRate;

    if (!rate) {
      return 0;
    } else {
      let total: number = 0;
      for (const infect of rate) {
        total += infect;
      }
      return total ?? 0;
    }
  }
  const applyLocationLockdown = (location: "work" | "social" | "housing" | "shopping") => {
    people?.ban(location);
  }
  const removeLocationLockdown = (location: "work" | "social" | "housing" | "shopping") => {
    people?.unban(location);
  }
  const enableMasking = () => {
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
  const changePopulation = (n: number) => {
    params.population = n;
    setPopulation(params.population);
  }
  const changeInfectivity = (n: number) => {
    params.infectivity = n;
  }
  const changeRecoveryTime = (n: number) => {
    params.recoveryTime = n;
  }
  const changeStartedInfected = (n: number) => {
    params.startedInfected = n;
  }
  return (
    <div className="flex flex-col justify-center items-center mt-20 gap-4 h-[100vh]">
      <p className="text-center text-xl font-bold">{`Time: ${time}`}</p> 
      <div className="flex flex-row gap-4 items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <Graph title="Susceptibles" color="blue" getParameter={getSusceptibles} max={population} min={0} />
          <Graph title="Infected" color="red" getParameter={getInfected} max={population} min={0} />
          <Graph title="Recovered" color="green" getParameter={getRecovered} max={population} min={0} />
          <Graph title="Contact Rate" color="orange" getParameter={getContactRate} max={1} min={0} />
          <Graph title="Infect Rate" color="magenta" getParameter={getInfectRate} max={1} min={0} />
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
          <div className="flex flex-col justify-center items-center bg-blue-400 rounded-md p-2">
            <p className="text-base text-center"> Selective Lockdown </p>
            <ControlMethod name="Lockdown Work" apply={() => applyLocationLockdown("work")} remove={() => removeLocationLockdown("work")} />
            <ControlMethod name="Lockdown Social" apply={() => applyLocationLockdown("social")} remove={() => removeLocationLockdown("social")} />
            <ControlMethod name="Lockdown Shopping" apply={() => applyLocationLockdown("shopping")} remove={() => removeLocationLockdown("shopping")} />
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-center items-center gap-4">
        <div className="flex flex-col justify-center items-center gap-2">
          <p className="text-lg text-center"> Virus Parameters </p>
          <ValueChanger
            changeTarget={changeInfectivity}
            name="Infectivity"
            max={1}
            min={0.01}
            step={0.01}
            disabled={started}
          />
          <ValueChanger
            changeTarget={changeRecoveryTime}
            name="Recovery Time"
            max={50000}
            min={1000}
            step={100}
            disabled={started}
          />
          <ValueChanger
            changeTarget={changeStartedInfected}
            name="Started Infected"
            max={population}
            min={1}
            step={1}
            disabled={started}
          />
        </div>
        <ValueChanger 
          changeTarget={changeMaskCoefficient} 
          name="Mask Coefficient: (% reduction in virus infectivity)" 
          max={1}
          min={0}
          step={0.01}
          disabled={started}
        />
        <ValueChanger 
          changeTarget={changePopulation} 
          name="Population"
          max={1000}
          min={1}
          step={1}
          disabled={started}
        />
      </div>

    </div>
  );
}

export default App;
