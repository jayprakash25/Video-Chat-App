import "./App.css";
import { Routes, Route } from "react-router-dom";
import { SocketProvider } from "./Providers/Socket";
import Room from "./Components/Room";
import LobbyScreen from "./Components/Lobby";

function App() {
  return (
    <div>
      <SocketProvider>
        <Routes>
          <Route path="/" element={<LobbyScreen />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </SocketProvider>
    </div>
  );
}

export default App;
