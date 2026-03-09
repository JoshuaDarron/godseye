import type { ConnectionStatus as Status } from '../../hooks/useWebSocket'

const COLOR_MAP: Record<Status, string> = {
  connected: 'bg-green-500',
  connecting: 'bg-yellow-500',
  disconnected: 'bg-red-500',
}

const LABEL_MAP: Record<Status, string> = {
  connected: 'Connected',
  connecting: 'Connecting...',
  disconnected: 'Disconnected',
}

export default function ConnectionStatus({ status }: { status: Status }) {
  return (
    <div className="fixed top-4 right-4 flex items-center gap-2 rounded bg-black/70 px-3 py-1.5 text-xs text-white">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${COLOR_MAP[status]}`} />
      {LABEL_MAP[status]}
    </div>
  )
}
