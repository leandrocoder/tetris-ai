function initializeInput(tetris) {
    document.addEventListener('keydown', event => {
        console.log(event.keyCode);

        if (event.keyCode === 37) {
            tetris.playerMove(-1);
        } else if (event.keyCode === 38) {
            tetris.playerRotate(1);
        } else if (event.keyCode === 39) {
            tetris.playerMove(1);
        } else if (event.keyCode === 40) {
            tetris.playerDrop();
        } else if (event.keyCode === 107) tetris.tickSpeed++;
        else if (event.keyCode === 109) tetris.tickSpeed--;
        if (tetris.tickSpeed < 1) tetris.tickSpeed = 1;
        if (tetris.tickSpeed > 100) tetris.tickSpeed = 100;
        else if (event.keyCode === 72) { // Pressione a tecla 'H' para segurar a peça
            tetris.playerHold();
        }
    });
}