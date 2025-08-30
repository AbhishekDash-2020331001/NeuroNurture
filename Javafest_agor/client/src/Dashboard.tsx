import React from 'react';
import { Link } from 'react-router-dom';

interface Game {
    name: string;
    path: string;
}

const games: Game[] = [
    { name: 'Gesture Game', path: '/gestureGame' },
    { name: 'Mirror Posture', path: '/mirrorPosture' },
    { name: 'Gaze Tracker', path: '/gazeTracker' },
    { name: 'Repeat With Me', path: '/repeatWithMe' },
    { name: 'Dance Doodle', path: '/danceDoodle' },
    // { name: 'Game 5', path: '/game5' },
];

const Dashboard: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-3xl font-bold mb-8 text-center"> Game Dashboard</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {games.map((game, index) => (
                    <Link to={game.path} key={index}>
                        <div className="p-6 rounded-2xl bg-white shadow-md hover:shadow-lg transition duration-300 cursor-pointer text-center relative overflow-hidden group">
                            {/* Special styling for Gaze Tracker */}
                            {game.name === 'Gaze Tracker' && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            )}
                            
                            {/* Special styling for Dance Doodle */}
                            {game.name === 'Dance Doodle' && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                            )}
                            
                            <h2 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                {game.name}
                            </h2>
                            
                            <p className="text-sm text-gray-500 mt-2 group-hover:text-blue-500 transition-colors">
                                Click to play
                            </p>
                            
                            {/* Hover effect for Gaze Tracker */}
                            {game.name === 'Gaze Tracker' && (
                                <div className="mt-3 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    👁️ Eye tracking enabled
                                </div>
                            )}
                            
                            {/* Hover effect for Dance Doodle */}
                            {game.name === 'Dance Doodle' && (
                                <div className="mt-3 text-xs text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    🕺 AI pose detection
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;