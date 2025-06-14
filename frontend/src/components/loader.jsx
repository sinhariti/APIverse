// DotLoader.jsx
//loading component while waiting for content to generate 
import React from "react";

export default function DotLoader() {
  return (
    <div className="flex space-x-1 items-center justify-center mt-2">
      <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" />
    </div>
  );
}