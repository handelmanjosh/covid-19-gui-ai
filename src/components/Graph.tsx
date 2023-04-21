import { useEffect, useRef, useState } from "react";

type GraphProps = {
    title: string;
    color: string
    getParameter: () => number;
    max: number;
    min: number;
}

export default function Graph({title, color, getParameter, max, min}: GraphProps) {
    const canvasRef = useRef<any>(null);
    const contextRef = useRef<{context: CanvasRenderingContext2D | null}>({context: null});
    const [data, setData] = useState<number[]>([]);
    const [stats, setStats] = useState({max: max, min: min})
    useEffect(() => {
        canvasRef.current.width = 200;
        canvasRef.current.height = 100;
        contextRef.current.context = canvasRef.current.getContext("2d");
        requestAnimationFrame(frame);
    }, []);
     useEffect(() => {
        stats.max = max;
        stats.min = min;
    }, [max, min]);
    const frame = () => {
        clearCanvas();
        updateData();
        draw();
        requestAnimationFrame(frame);
    }
    const draw = () => {
        let context = contextRef.current.context!;
        context.beginPath();
        let count = 0;
        let diff = stats.max - stats.min;
        let yScale = canvasRef.current.height / diff;
        let xScale = (data.length / canvasRef.current.width !== 0) ? data.length / canvasRef.current.width : 1;
        data.forEach(point => {
            if (count === 0) {
                context.moveTo(count / xScale, canvasRef.current.height - point * yScale);
            } else {
                context.lineTo(count / xScale, canvasRef.current.height - point * yScale);
            }
            count++;
        });
        context.lineWidth = 5;
        context.strokeStyle = color;
        context.stroke();
    }
    const clearCanvas = () => {
        let context = contextRef.current.context!;
        context.fillStyle = "white";
        context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    const updateData = () => {
        let currentData = getParameter();
        data.push(currentData);
    }
    return (
        <div className="flex flex-col justify-center items-center gap-2">
            <p className="text-black"> {title} </p>
            <canvas className="border-2 border-black" ref={canvasRef} />
        </div>
    )
}