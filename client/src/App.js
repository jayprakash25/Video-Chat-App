import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import { SocketProvider } from "./Providers/Socket";
import Room from "./Components/Room";

function App() {
  return (
    <div>
      <SocketProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </SocketProvider>
    </div>
  );
}

export default App;
