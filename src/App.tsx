import { useState } from "react";
import ARScene from "./components/ARScene";
import "./App.css";

function App() {
  const [started, setStarted] = useState(true);

  // Dùng base URL từ vite config
  const targetSrc = `${import.meta.env.BASE_URL}targets/targets.mind`;

  if (!started) {
    return (
      <div className="start-screen">
        <h1>GradAR</h1>
        <p>Chúc mừng Tốt nghiệp!</p>
        <button onClick={() => setStarted(true)}>Bắt đầu AR</button>
        <p className="hint">
          Chĩa camera vào tấm bằng tốt nghiệp để xem hiệu ứng AR
        </p>
      </div>
    );
  }

  return <ARScene targetSrc={targetSrc} />;
}

export default App;
