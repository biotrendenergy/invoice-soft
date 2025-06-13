"use client";
import "./print_style.css";
const PrintButton = () => {
  const PrintFunction = () => {
    window.print();
  };
  return (
    <button className="btn" onClick={PrintFunction}>
      Print
    </button>
  );
};

export default PrintButton;
