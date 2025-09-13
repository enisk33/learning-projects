'use client'

import * as React from 'react'
import { Toaster as Sonner, toast } from 'sonner'

const Toaster = () => {
  return (
    <Sonner 
      position="top-right"
      theme="light"
      richColors
      closeButton
    />
  )
}

export { Toaster, toast }
