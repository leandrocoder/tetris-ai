const target = document.getElementById('debug-ui');

var game = null;
var ai = null;

function init() {
    game = new TetrisGame('gamecanvas');
    ai = new TetrisAI(game);
    ai.train();
}

init();


const UI = () => {

    const [tickSpeed, setTickSpeed] = React.useState(1);
    const [debugInfo, setDebugInfo] = React.useState({});

    const playTime = React.useRef(0);

    const playTimeString = React.useMemo(() => {
        const date = new Date(0);
        date.setSeconds(playTime.current);
        let timeString = date.toISOString().substring(11, 19);
        let days = Math.floor(playTime.current / 86400 );
        return days + 'd - ' + timeString;
    }, [playTime, playTime.current]);

    const handleChange = (event) => {
        const value = parseInt(event.target.value);
        setTickSpeed(value);
        game.framework.tickSpeed = value;
    };

    function save(data) {
        Neutralino.filesystem.writeFile('./genome.json', JSON.stringify(data, null, 4));
    }   

    React.useEffect(() => {
        ai.addEventListener('data', data => {
            setDebugInfo(data)
        });

        ai.addEventListener('save-data', data => {
            save(data);
        });
        
        game.addEventListener('tick', ({delta}) => {
            playTime.current += delta / 1000;
        });

    }, []);

    return (
        <div>
            <h1>TETRIS</h1>
            <button onClick={() => save()}>TEST</button>
            <div style={{ display: 'flex', gap:'8px' }}>
                <p>Tick Speed:</p>
                <input
                    type="range"
                    min="1"
                    max="300"
                    value={tickSpeed}
                    onChange={handleChange}
                    />
                <p>{tickSpeed}</p>
            </div>
            <pre>{JSON.stringify(debugInfo, null, 4)}</pre>
        </div>
    );
}

ReactDOM.render(<UI />, document.getElementById('debug-ui'));