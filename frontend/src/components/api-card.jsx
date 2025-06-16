import React, { useState } from "react";
import { ChevronDown, ChevronUp, Zap, HeartPulse } from "lucide-react";
import { CopyCheck, Copy } from "lucide-react";
import { Tooltip } from "./tooltip";
import IntegrationModal from "./suggestion";
import DotLoader from "./loader";

export function ApiCard({ api }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [healthData, setHealthData] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleExpanded = () => setIsExpanded(!isExpanded);
  const PORT = import.meta.env.VITE_API_BASE_URL;

  const handleIntegrationSuggest = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${PORT}/api/suggest-integration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_id: api.name,
          description: api.description,
          frontend: "react",
          use_case: "fetch data and handle auth",
        }),
      });
      const data = await res.json();
      setCodeSnippet(data.code_snippet || "No response received");
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching integration snippet:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleHealthCheck = async () => {
    // console.log("Health check triggered for API:", api);
    setHealthLoading(true);
    setHealthData(null);
    try {
      const res = await fetch(`${PORT}/api/health-check/${api._id}`);
      const data = await res.json();
      setHealthData(data);
    } catch (error) {
      console.error("Health check error:", error);
      setHealthData({ status: "Down", latency_ms: -1 });
    } finally {
      setHealthLoading(false);
      setIsHealthModalOpen(true);
    }
  };

  return (
    <div
      className={`relative rounded-3xl bg-gray-700/70 backdrop-blur-sm border border-gray-600/50 
      transition-all duration-300 cursor-pointer
      ${isModalOpen ? "opacity-30 pointer-events-none" : ""}
      hover:shadow-[0_0_30px_rgba(127,92,255,0.3)] hover:border-purple-500/50`}
      onClick={toggleExpanded}
    >
      <div className="p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-white text-xl font-mono">{api.name}</h3>
          {isExpanded ? (
            <ChevronUp className="w-6 h-6 text-white" />
          ) : (
            <ChevronDown className="w-6 h-6 text-white" />
          )}
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4 animate-in fade-in">
            <div>
              <span className="text-gray-300 text-sm font-mono">Category</span>
              <p className="text-white text-lg">{api.category}</p>
            </div>

            <div>
              <p className="text-gray-200 text-base leading-relaxed">
                {api.description}
              </p>
            </div>

            <div>
              <span className="text-gray-300 text-sm font-mono">Endpoint:</span>
              <div className="mt-1 p-3 bg-gray-800/50 rounded-lg border border-gray-600/30 flex items-center justify-between gap-2">
                <code className="text-green-400 font-mono text-sm break-all">{api.api_url}</code>

                <Tooltip content={copied ? "Copied!" : "Copy endpoint"}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(api.api_url);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
                    }}
                    className="p-1 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-colors"
                  >
                    {copied ? <CopyCheck className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </Tooltip>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div className="flex-1">
                <p className="text-gray-300 text-sm">{api.additionalInfo}</p>
              </div>

              <div className="flex gap-3 ml-4 items-center">
                {/* Health Button */}
                <Tooltip content="Check the health status of this API">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHealthCheck();
                    }}
                    className="p-2 rounded-full bg-teal-600 hover:bg-teal-500 text-white"
                  >
                    <HeartPulse className="w-5 h-5" />
                  </button>
                </Tooltip>

                {/* Integration Button with Loader */}
                <Tooltip content="Suggest integration code for this API">
                  <button
                    
                    onClick={(e) => {
                      e.stopPropagation();
                      handleIntegrationSuggest();
                    }}
                    className="p-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white"
                  >
                    <Zap className="w-5 h-5" />
                  </button>
                </Tooltip>
                {/* Full-Screen Loader */}
                {loading && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <DotLoader />
                      <p className="text-white font-medium">Generating integration code...</p>
                    </div>
                  </div>
                )}
                {/* Auth Tag */}
                {api.hasAuth && (
                  <Tooltip content="Authentication Required">
                    <span className="px-4 py-2 bg-teal-600 text-white rounded-full text-sm font-medium cursor-help">
                      Auth
                    </span>
                  </Tooltip>
                )}

                {/* CORS Tag */}
                <Tooltip content={api.hasCors ? "CORS Enabled" : "CORS Not Supported"}>
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

        {/* Integration Modal */}
        <IntegrationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          loading={loading}
          api={{
            name: api.name,
            description: api.description,
            endpoint: api.api_url,
            hasAuth: api.hasAuth,
            hasCors: api.hasCors,
            codeSnippet: codeSnippet,
          }}
        />

        {/* Health Check Modal */}
        {isHealthModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[9999]"
            onClick={() => setIsHealthModalOpen(false)}
          >
            <div
              className="bg-gray-900 border border-teal-500 rounded-xl p-6 w-[90%] max-w-md mx-4 text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl mb-4 font-semibold text-teal-400">
                API Health Check
              </h2>

              {healthLoading ? (
                <p className="text-center text-gray-400">Checking...</p>
              ) : (
                <div className="space-y-2">
                  <p>
                    <span className="font-bold">Status:</span>{" "}
                    <span
                      className={`${
                        healthData?.status === "Healthy"
                          ? "text-green-400"
                          : healthData?.status === "Unhealthy"
                          ? "text-yellow-400"
                          : "text-red-500"
                      }`}
                    >
                      {healthData?.status}
                    </span>
                  </p>
                  <p>
                    <span className="font-bold">Latency:</span>{" "}
                    {healthData?.latency_ms >= 0
                      ? `${healthData.latency_ms} ms`
                      : "N/A"}
                  </p>
                </div>
              )}

              <button
                className="mt-4 bg-teal-600 hover:bg-teal-500 text-white py-2 px-4 rounded"
                onClick={() => setIsHealthModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}