import React from "react";
import "./Circle.css";

const Circle = ({colour, outlineColour, text}) => (
  <div style={{backgroundColor: colour}}className="circle">{text}</div>
);

export default Circle;