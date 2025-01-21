import React from "react";
import "./Step.module.scss";

export default function StepView({ positionX, positionY, width, height }: any) {
  return (
    <div
      className="step"
      style={{
        left: `${positionX}vw`,
        top: `${positionY}vh`,
        width: `${width}vw`,
        height: `${height}vh`,
      }}
    />
  );
}
