import { useState, useEffect } from "react";
import Player from "../../models/Player";

export default function usePlayerViewModel() {
  const [player, setPlayer] = useState(new Player(50, 0, 0.5));
  const [position, setPosition] = useState({ x: player.positionX, y: player.positionY });

  const updatePlayer = () => {
    player.updatePosition();
    setPosition({ x: player.positionX, y: player.positionY });
    requestAnimationFrame(updatePlayer);
  };

  useEffect(() => {
    updatePlayer();
  }, []);

  const moveRight = () => {
    player.moveRight();
    setPosition({ x: player.positionX, y: player.positionY });
  };

  const moveLeft = () => {
    player.moveLeft();
    setPosition({ x: player.positionX, y: player.positionY });
  };

  const jump = () => {
    player.jump();
    setPosition({ x: player.positionX, y: player.positionY });
  };

  return { position, moveRight, moveLeft, jump };
}
