import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Tooltip } from "./tooltip";

export function ApiCard({ api }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`
        relative rounded-3xl bg-gray-700/70 backdrop-blur-sm border border-gray-600/50 
        transition-all duration-300 cursor-pointer
        hover:shadow-[0_0_30px_rgba(127,92,255,0.3)] hover:border-purple-500/50
        ${isExpanded ? "shadow-[0_0_20px_rgba(127,92,255,0.2)]" : ""}
      `}
      onClick={toggleExpanded}
    >
      <div className="p-6">
        {/* Header - Always visible */}
        <div className="flex justify-between items-center">
          <h3 className="text-white text-xl font-mono">{api.name}</h3>
          {isExpanded ? (
            <ChevronUp className="w-6 h-6 text-white" />
          ) : (
            <ChevronDown className="w-6 h-6 text-white" />
          )}
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 space-y-4 animate-in fade-in ">
            {/* Category */}
            <div>
              <span className="text-gray-300 text-sm font-mono">Category</span>
              <p className="text-white text-lg">{api.category}</p>
            </div>

            {/* Description */}
            <div>
              <p className="text-gray-200 text-base leading-relaxed">
                {api.description}
              </p>
            </div>

            {/* Endpoint in markdown format */}
            <div>
              <span className="text-gray-300 text-sm font-mono">Endpoint:</span>
              <div className="mt-1 p-3 bg-gray-800/50 rounded-lg border border-gray-600/30">
                <code className="text-green-400 font-mono text-sm break-all">
                  {api.endpoint}
                </code>
              </div>
            </div>

            {/* Tags and Additional Info */}
            <div className="flex justify-between items-end">
              <div className="flex-1">
                <p className="text-gray-300 text-sm">{api.additionalInfo}</p>
              </div>

              {/* Auth and CORS Tags */}
              <div className="flex gap-3 ml-4">
                {api.hasAuth && (
                  <Tooltip content="Authentication Required: This API requires an API key, token, or other authentication method to access.">
                    <span className="px-4 py-2 bg-teal-600 text-white rounded-full text-sm font-medium cursor-help">
                      Auth
                    </span>
                  </Tooltip>
                )}
                {/* Always show CORS tag with different colors based on support */}
                <Tooltip
                  content={
                    api.hasCors
                      ? "CORS Enabled: Cross-Origin Resource Sharing is supported, allowing web browsers to make requests from different domains."
                      : "CORS Not Supported: This API does not support Cross-Origin Resource Sharing. Direct browser requests may be blocked."
                  }
                >
                  <span
                    className={`px-4 py-2 text-white rounded-full text-sm font-medium cursor-help ${
                      api.hasCors ? "bg-green-600" : "bg-red-400"
                    }`}
                  >
                    CORS
                  </span>
                </Tooltip>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}