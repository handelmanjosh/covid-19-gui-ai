import { useEffect, useState } from "react";

type ControlMethodControllerProps = {
    activate: () => boolean;
    apply: () => any;
    deactivate?: () => boolean;
    deapply?: () => any;
    name: string;
}
export default function ControlMethodController({name, activate, apply, deactivate, deapply}: ControlMethodControllerProps) {
    const [active, setActive] = useState<boolean>(false);
    const [interval, set] = useState<any>(null)
    useEffect(() => {
        if (active) {
            const interval = setInterval(frame, 100);
            set(interval);
        } else {
            clearInterval(interval)
        }
    }, [active]);
    const frame = () => {
        console.log("hello from setInterval")
        if (activate()) {
            apply();
        }
        if (deactivate) {
            if (deactivate()) {
                deapply!();
            }
        }
    }
    return (
        <div className="flex flex-row justify-center items-center gap-2">
            <input 
                type="checkbox" 
                onChange={() => setActive(!active)}
            />
            {name}
        </div>
    )
}