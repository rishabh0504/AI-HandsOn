import { Message } from "@/types";
import { useState } from "react";

export function useFetchStream() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | undefined>();

  const fetchStream = async (endPoint: string, payload: any) => {
    setLoading(true);

    try {
      const res = await fetch(endPoint, {
        method: "POST",
        body: payload,
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
        const decodedResponse: any = decoder.decode(value, { stream: true });
        console.log("decodedResponse", decodedResponse);
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
