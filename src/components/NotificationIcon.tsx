import { 
  Eye, 
  MessageCircle, 
  CheckCircle, 
  AlertTriangle, 
  Palette, 
  Bell 
} from 'lucide-react'

interface Props {
  type: string
  className?: string
}

export default function NotificationIcon({ type, className = 'w-5 h-5' }: Props) {
  switch (type) {
    case 'new_visit':
      return <Eye className={`${className} text-brun`} />
    case 'whatsapp_click':
      return <MessageCircle className={`${className} text-succes`} />
    case 'shop_activated':
      return <CheckCircle className={`${className} text-succes`} />
    case 'shop_suspended':
      return <AlertTriangle className={`${className} text-alerte`} />
    case 'model_published':
      return <Palette className={`${className} text-dore`} />
    default:
      return <Bell className={`${className} text-pierre-500`} />
  }
}