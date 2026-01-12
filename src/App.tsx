import { useState } from "react";
import ARScene from "./components/ARScene";
import "./App.css";

function App() {
  const [started, setStarted] = useState(false);

  // Bạn cần tạo file .mind từ ảnh target
  // Dùng tool: https://hiukim.github.io/mind-ar-js-doc/tools/compile
  const targetSrc = "/targets/diploma.mind";

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
