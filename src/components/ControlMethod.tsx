import { useEffect, useState } from "react";


type ControlMethodProps = {
    apply: () => any;
    remove: () => any;
    name: string;
}
export default function ControlMethod({ apply, remove,  name}: ControlMethodProps) {
    const [active, setActive] = useState<boolean>(false);
    useEffect(() => {
        try {    
            if (active) {
                apply();
            } else {
                remove();
            }
        } catch (e) {

        }
    }, [active]);
    return (
        <div className="flex flex-row justify-center gap-2 items-center">
            <input 
                type="checkbox" 
                onChange={() => setActive(!active)}
            />
            {name}
        </div>
    )
}