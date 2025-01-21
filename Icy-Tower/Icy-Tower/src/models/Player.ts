export default class Player {
    positionX: number;
    positionY: number;
    velocityY: number;
    gravity: number;
    isJumping: boolean;
    isPaused: boolean;
  
    constructor(x: number, y: number, gravity: number) {
      this.positionX = x;
      this.positionY = y;
      this.velocityY = 0;
      this.gravity = gravity;
      this.isJumping = false;
      this.isPaused = false;
    }
  
    moveRight() {
      this.positionX = Math.min(this.positionX + 5, 100 - 10);
    }
  
    moveLeft() {
      this.positionX = Math.max(this.positionX - 5, 10);
    }
  
    jump() {
      if (!this.isJumping) {
        this.isJumping = true;
        this.velocityY = 5;
      }
    }
  
    updatePosition() {
      if (this.isJumping) {
        this.positionY += this.velocityY;
        this.velocityY -= this.gravity;
        if (this.positionY <= 0) {
          this.positionY = 0;
          this.isJumping = false;
        }
      }
    }
  }
  