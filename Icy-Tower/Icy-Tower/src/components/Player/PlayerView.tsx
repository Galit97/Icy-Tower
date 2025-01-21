import React from "react";
import usePlayerViewModel from "./PlayerViewModel";
import "./Player.module.scss";
import backgroundImg from "../../assets/Images/bricks.png";
import playerImg from "../../assets/Images/character1.png";

export default function PlayerView() {
  const { position, moveRight, moveLeft, jump } = usePlayerViewModel();

  return (
    <div className="game-container">
      <div className="background" />
      style={{ backgroundImage: `url(${backgroundImg})` }}

      <div
        className="player"
        style={{
          left: `${position.x}vw`,
          bottom: `${position.y}vh`,
          backgroundImage: `url(${playerImg})`,

        }}
      />

      <div className="controls">
        <button onClick={moveLeft}>←</button>
        <button onClick={jump}>↑</button>
        <button onClick={moveRight}>→</button>
      </div>
    </div>
  );
}
