import { useEffect, useState } from "react";

type ValueChangerProps = {
    changeTarget: (n: number) => any;
    max: number;
    min: number;
    step: number;
    name: string;
    disabled: boolean;
}
export default function ValueChanger({changeTarget, max, min, step, name, disabled }: ValueChangerProps) {
    const [value, setValue] = useState<number>(min);
    useEffect(() => {
        changeTarget(value);
    }, [value])
    return (
        <div className="flex flex-col justify-center items-center">
            <p className="text-base text-center">{name}</p>
            <input
                disabled={disabled}
                type="range"
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue(parseFloat(event.target.value))}
            />
            <p className="text-base text-center">{value}</p>
        </div>
    )
}