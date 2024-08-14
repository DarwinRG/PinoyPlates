// src/components/UnderDevelopment.js
import React from 'react'
import './under-development.css' 

const UnderDevelopment = () => {
  return (
    <>
      <div className="under-development">
        <h1>Under Development</h1>
        <p>This site is currently under development for screen sizes smaller than 1100px.</p>
        <p>For the best experience, please use a device with a screen size larger than 1100px.</p>
        <p>We appreciate your understanding and patience as we work to improve the user experience.</p>
        <div class="hourglassBackground">
          <div class="hourglassContainer">
            <div class="hourglassCurves"></div>
            <div class="hourglassCapTop"></div>
            <div class="hourglassGlassTop"></div>
            <div class="hourglassSand"></div>
            <div class="hourglassSandStream"></div>
            <div class="hourglassCapBottom"></div>
            <div class="hourglassGlass"></div>
          </div>
        </div>
      </div> 
    </>
    
  )
}

export default UnderDevelopment
