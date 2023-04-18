function playerInput(tetris) {
    document.addEventListener('keydown', event => {
        console.log(event.keyCode);

        if (event.keyCode === 37) {
            tetris.move(-1);
        } else if (event.keyCode === 38) {
            tetris.rotate(1);
        } else if (event.keyCode === 39) {
            tetris.move(1);
        } else if (event.keyCode === 40) {
            tetris.drop();
        } else if (event.keyCode === 107) tetris.tickSpeed++;
        else if (event.keyCode === 109) tetris.tickSpeed--;
        else if (event.keyCode === 96) tetris.tickSpeed = 1;
        if (tetris.tickSpeed < 1) tetris.tickSpeed = 1;
        if (tetris.tickSpeed > 100) tetris.tickSpeed = 100;
    });
}