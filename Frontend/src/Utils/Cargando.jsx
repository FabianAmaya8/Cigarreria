import { useNavigate } from "react-router-dom";
import { Hourglass } from "ldrs/react";
import { ArrowBigLeftDash } from 'lucide-react';

export function Loading() {
    return (
        <div className="cargando">
            <Hourglass size="150" color="var(--rojo-500)" />
        </div>
    )
}

export function Error({msg, errorCode}) {
    return (
        <div className='cargando'>
            <i className="bx bx-error"></i>
            <h5>{msg}</h5>
        </div>
    )
}

export function BtnVolver(){
    const navigate = useNavigate();

    return(
        <div className="volver">
            <button onClick={() => navigate(-1)}>
                <ArrowBigLeftDash size={25}/>
            </button>
        </div>
    )
}
