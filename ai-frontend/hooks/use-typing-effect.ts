"use client"

import { useState, useEffect } from "react"

export function useTypingEffect(text: string, speed = 50) {
  const [displayedText, setDisplayedText] = useState("")

  useEffect(() => {
    if (speed === 0) {
      setDisplayedText(text)
      return
    }

    setDisplayedText("")
    let index = 0

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text[index])
        index++
      } else {
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed])

  return displayedText
}
