import { Link } from 'react-router-dom';

interface Game {
    name: string;
    path: string;
}

const games: Game[] = [
    { name: 'Gesture Game', path: '/gestureGame' },
     { name: 'Mirror Posture', path: '/mirrorPosture' },
    // { name: 'Game 3', path: '/game3' },
    // { name: 'Game 4', path: '/game4' },
    // { name: 'Game 5', path: '/game5' },
];

const Dashboard: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-3xl font-bold mb-8 text-center">🎮 Game Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {games.map((game, index) => (
                    <Link to={game.path} key={index}>
                        <div className="p-6 rounded-2xl bg-white shadow-md hover:shadow-lg transition duration-300 cursor-pointer text-center">
                            <h2 className="text-xl font-semibold text-gray-800">{game.name}</h2>
                            <p className="text-sm text-gray-500 mt-2">Click to play</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
