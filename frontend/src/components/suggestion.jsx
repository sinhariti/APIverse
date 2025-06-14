import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Copy, X } from "lucide-react";

export default function IntegrationModal({ isOpen, onClose, api, loading }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(api.codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-2xl border border-gray-600 w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-lg focus:outline-none">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-600">
            <Dialog.Title className="text-2xl font-mono text-purple-400">Suggested Integration Code</Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <X className="w-6 h-6 text-white" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
            <div>
              <h3 className="text-lg text-white font-mono mb-2">Integration for: {api.name}</h3>
              <p className="text-gray-300 text-sm">{api.description}</p>
            </div>

            <div className="relative">
              <button
                onClick={handleCopy}
                className="absolute top-4 right-4 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors z-10"
                title="Copy code"
              >
                {copied ? (
                  <span className="text-green-400 text-sm">Copied!</span>
                ) : (
                  <Copy className="w-4 h-4 text-white" />
                )}
              </button>
              <pre className="bg-gray-900 p-4 rounded-lg text-green-400 whitespace-pre-wrap text-sm max-h-[300px] overflow-auto">
                <code>{api.codeSnippet}</code>
              </pre>
            </div>

            <div className="text-sm text-gray-400 space-y-1 pt-2">
              <p>
                <strong>Endpoint:</strong>{" "}
                <code className="text-green-400">{api.endpoint}</code>
              </p>
              <p>
                <strong>Authentication:</strong>{" "}
                <span className={api.hasAuth ? "text-yellow-400" : "text-green-400"}>
                  {api.hasAuth ? "Required" : "Not Required"}
                </span>
              </p>
              <p>
                <strong>CORS Support:</strong>{" "}
                <span className={api.hasCors ? "text-green-400" : "text-red-400"}>
                  {api.hasCors ? "Enabled" : "Not Supported"}
                </span>
              </p>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}