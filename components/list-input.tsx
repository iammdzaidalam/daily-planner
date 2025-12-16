"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X } from "lucide-react"

interface ListInputProps {
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  maxItems?: number
  disabled?: boolean
}

export function ListInput({
  items,
  onChange,
  placeholder = "Add item...",
  maxItems = 10,
  disabled = false,
}: ListInputProps) {
  const [inputValue, setInputValue] = useState("")

  const addItem = () => {
    if (inputValue.trim() && items.length < maxItems) {
      onChange([...items, inputValue.trim()])
      setInputValue("")
    }
  }

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addItem()
    }
  }

  return (
    <div className="space-y-3">
      {!disabled && (
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={addItem}
            disabled={!inputValue.trim() || items.length >= maxItems}
            size="icon"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 group">
              <span className="flex-1 text-sm">{item}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        disabled && <p className="text-sm text-muted-foreground italic">No items added</p>
      )}
    </div>
  )
}
