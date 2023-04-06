
type SingleButtonProps = {
    click: () => any;
    text: string;
}
export default function SingleButton({ click, text }: SingleButtonProps) {
    return (
        <button
            className="flex items-center justify-center text-center rounded-lg bg-blue-600 text-white w-auto py-2 px-4 h-auto hover:brightness-90 active:brightness-75"
            onClick={click}
        >
            {text}
        </button>
    )
}