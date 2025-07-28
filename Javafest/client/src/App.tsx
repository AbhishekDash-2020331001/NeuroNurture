import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import GestureRecognizerComponent from './game/gestureRecognizing/GestureRecognizerComponent';
import MirrorPostureGame from './game/mirrorPosture/MirrorPostureGame';
// import Game1 from './games/Game1';
// import Game2 from './games/Game2';
// import Game3 from './games/Game3';
// import Game4 from './games/Game4';
// import Game5 from './games/Game5';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/gestureGame" element={<GestureRecognizerComponent />} />
        <Route path="/mirrorPosture" element={<MirrorPostureGame />} />

      </Routes>
    </Router>
  );
};

export default App;
