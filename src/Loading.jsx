import  { useRef } from "react";
import LoadingBar from "react-top-loading-bar";

const LoadingBarComponent = () => {
  const ref = useRef(null);

  // Function to start loading
  const startLoading = () => {
    ref.current?.continuousStart();
  };

  // Function to complete loading
  const completeLoading = () => {
    ref.current?.complete();
  };

  return (
    <div>
      <LoadingBar color="#f11946" ref={ref} />
      <button onClick={startLoading}>Start Loading</button>
      <button onClick={completeLoading}>Complete Loading</button>
    </div>
  );
};

export default LoadingBarComponent;
