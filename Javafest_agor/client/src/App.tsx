import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import GestureRecognizerComponent from './game/gestureRecognizing/GestureRecognizerComponent';
import MirrorPostureGame from './game/mirrorPosture/MirrorPostureGame';
import GazeTracker from './game/gaze/test';
import RepeatWithMeGame from './game/repeatWithMe/RepeatWithMeGame';
import DanceDoodleGame from './game/dance_doodle';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/gestureGame" element={<GestureRecognizerComponent />} />
        <Route path="/mirrorPosture" element={<MirrorPostureGame />} />
        <Route path="/gazeTracker" element={<GazeTracker />} />
        <Route path="/repeatWithMe" element={<RepeatWithMeGame />} />
        <Route path="/danceDoodle" element={<DanceDoodleGame />} />

      </Routes>
    </Router>
  );
};

export default App;
