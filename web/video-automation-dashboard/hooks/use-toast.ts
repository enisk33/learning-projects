'use client'

import { toast } from 'sonner'

export const useToast = () => {
  return {
    toast: (props: {
      title?: string
      description?: string
      variant?: 'default' | 'destructive'
      className?: string
    }) => {
      if (props.variant === 'destructive') {
        return toast.error(props.title || 'Hata', {
          description: props.description,
        })
      }
      return toast.success(props.title || 'Başarılı', {
        description: props.description,
        className: props.className,
      })
    },
  }
}
