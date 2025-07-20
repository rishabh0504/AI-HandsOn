import { BACKEND_ENDPOINT, DEFAULT_LLM_MODEL } from "@/common/constant";
import { Message } from "@/components/chat-interface";
import { useState } from "react";

export function useFetchStream() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | undefined>();

  const fetchStream = async (endPoint: string, prompt: string) => {
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_ENDPOINT}${endPoint}`, {
        method: "POST",
        body: JSON.stringify({ prompt: prompt, model: DEFAULT_LLM_MODEL }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok || !res.body) {
        throw new Error("Network response error");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let partialText = "";
      while (true) {
        const { done, value } = await reader.read();
        const decodedResponse: any = decoder.decode(value);
        setLoading(false);
        try {
          const response: any = JSON.parse(decodedResponse);
          partialText += response.response;
          setMessage({
            role: response?.role,
            content: partialText,
            created_at: new Date(response?.created_at),
            done: response?.done,
          });
          if (response?.done) {
            break;
          }
        } catch (e: any) {}
      }
    } catch (err) {
      console.error("Streaming error", err);
    } finally {
      setLoading(false);
    }
  };
  return { fetchStream, loading, message };
}
