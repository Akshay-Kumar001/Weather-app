import React from 'react'
import "./Weather.css"

const Weather = () => {
    return (
        <div className='weather'>
            <p className='city'>New York City, NY, United States</p>
            <img className='WeaImg' src="src/images/night-removebg-preview.png" alt="night" />
            <div className='temperature'>
                <p className='tempe read'>21°</p>
                <p className='tempe'>Clear</p>
                <p className='tempe'>Day 30° . Night20°</p>
            </div>
        </div>
    )
}

export default Weather