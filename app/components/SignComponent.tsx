import { useState } from "react";
import { useOkto, getAccount } from "@okto_web3/react-sdk";
import { recoverMessageAddress } from "viem";
import CopyButton from "./CopyButton";

interface SignComponentProps {}

const SignComponent: React.FC<SignComponentProps> = () => {
  const oktoClient = useOkto();
  const [message, setMessage] = useState<string>("");
  const [typedData, setTypedData] = useState<string>("");
  const [resultModalVisible, setResultModalVisible] = useState<boolean>(false);
  const [inputModalVisible, setInputModalVisible] = useState<boolean>(false);
  const [result, setResult] = useState<any>("");
  const [signType, setSignType] = useState<string>("");
  const [currentAction, setCurrentAction] = useState<"message" | "typedData" | null>(null);
  const [verificationResult, setVerificationResult] = useState<string>("");

  const handleOpenInputModal = (type: "message" | "typedData"): void => {
    setCurrentAction(type);
    setInputModalVisible(true);
  };

  const handleSignMessage = async (): Promise<void> => {
    try {
      const signature = await oktoClient.signMessage(message);
      console.log("Signed Message:", signature);
      setResult(signature);
      setSignType("Signed Message");
      setInputModalVisible(false);
      setResultModalVisible(true);
    } catch (error: any) {
      console.error("Error signing message:", error);
      setResult(`Error: ${error.message}`);
      setInputModalVisible(false);
      setResultModalVisible(true);
    }
  };

  const handleSignTypedData = async (): Promise<void> => {
    try {
      const parsedData = JSON.parse(typedData);
      const signature = await oktoClient.signTypedData(parsedData);
      console.log("Signed Typed Data:", signature);
      setResult(signature);
      setSignType("Signed Typed Data");
      setInputModalVisible(false);
      setResultModalVisible(true);
    } catch (error: any) {
      console.error("Error signing typed data:", error);
      setResult(`Error: ${error.message}`);
      setInputModalVisible(false);
      setResultModalVisible(true);
    }
  };

  const handleVerifySignature = async (): Promise<void> => {
    try {
      if (!message || !result) {
        throw new Error("No message or signature available for verification");
      }

      const recoveredAddress = await recoverMessageAddress({
        message,
        signature: result,
      });

      console.log("Recovered Address:", recoveredAddress);

      const accountResponse = await getAccount(oktoClient);
      const evmAccount = accountResponse.find((item: any) => item.caipId.startsWith("eip155:"));
      const evmAddress = evmAccount?.address?.toLowerCase();

      if (!evmAddress) {
        throw new Error("No EVM address found in account response");
      }

      if (recoveredAddress.toLowerCase() === evmAddress) {
        setVerificationResult(`✅ Valid Signature\nEVM Address: ${recoveredAddress}`);
      } else {
        setVerificationResult(`❌ Signature does not match known EVM address.\nRecovered: ${recoveredAddress}`);
      }
    } catch (error: any) {
      console.error("Verification Error:", error);
      setVerificationResult(`❌ Verification Error: ${error.message}`);
    }
  };

  return (
    <div className="w-full">
      {/* Main Buttons */}
      
        <button
          onClick={() => handleOpenInputModal("message")}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Sign Message
        </button>
        {/* <button
          onClick={() => handleOpenInputModal("typedData")}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Sign Typed Data
        </button> */}


      {/* Input Modal */}
      {inputModalVisible && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-11/12 max-w-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {currentAction === "message"
                ? "Okto signMessage"
                : "Okto signTypedData"}
            </h2>

            {currentAction === "message" ? (
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter message..."
                className="w-full px-4 py-2 border rounded-lg mb-4"
                autoFocus
              />
            ) : (
              <textarea
                rows={5}
                value={typedData}
                onChange={(e) => setTypedData(e.target.value)}
                placeholder='{"domain":{}, "types":{}, "message":{}}'
                className="w-full p-2 border rounded-lg mb-4"
                autoFocus
              />
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-400 transition-colors"
                onClick={() => setInputModalVisible(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 transition-colors"
                onClick={
                  currentAction === "message"
                    ? handleSignMessage
                    : handleSignTypedData
                }
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {resultModalVisible && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-black rounded-lg w-11/12 max-w-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4">
              {signType} Result
            </h2>
            <pre className="whitespace-pre-wrap break-words bg-gray-900 p-4 rounded text-white mb-4">
              <CopyButton text={result} />
              {result}
            </pre>

            {/* Verification Button */}
            {signType === "Signed Message" && (
              <div className="mt-4 flex justify-end">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  onClick={handleVerifySignature}
                >
                  Verify Signature
                </button>
              </div>
            )}

            {/* Verification Result */}
            {verificationResult && (
              <pre className="mt-4 whitespace-pre-wrap break-words bg-gray-800 p-4 rounded text-green-400">
                {verificationResult}
              </pre>
            )}

            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
                onClick={() => {
                  setResultModalVisible(false);
                  setVerificationResult("");
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignComponent;
