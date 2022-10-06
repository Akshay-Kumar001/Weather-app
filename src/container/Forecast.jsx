import React from 'react'
import "./Forecast.css"

const Forecast = () => {
    return (
        <div className='readings'>
            <p className='cityName'>Today's Forecast for New York City, NY, United States</p>
            <div className='forecast'>
                <div className="Morning day">
                    <p className='time'>Morning</p>
                    <h1 className='temp'>25°</h1>
                    <img src="data:image/png;base64,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" alt="sun" width="100px" height="100px" />
                    <p>0%</p>
                </div>
                <div className="Afternoon day">
                    <p className='time'>Afternoon</p>
                    <h1 className='temp'>25°</h1>
                    <img src="src/images/after.png" alt="cloudy" width="100px" height="100px" />
                    <p>0%</p>
                </div>
                <div className="Evening day">
                    <p className='time'>Evening</p>
                    <h1 className='temp'>25°</h1>
                    <img src="src/images/eve.png" alt="night" />
                    <p>0%</p>
                </div>
                <div className="Overnight day">
                    <p className='time night'>Overnight</p>
                    <h1 className='temp'>25°</h1>
                    <img src="src/images/night.png" alt="clear night" />
                    <p>0%</p>
                </div>
            </div>
        </div>
    )
}

export default Forecast