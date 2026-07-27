'use client'

import { useState } from 'react'
import Image from 'next/image'

interface NotificationItem {
  id: string
  avatar: string
  name: string
  action: string
  time: string
  category: string
  unread?: boolean
  message?: string
  file?: { name: string; size: string }
  tags?: string[]
  showActions?: 'friend_request' | 'reply' | null
}

const notifications: NotificationItem[] = [
  {
    id: '1',
    avatar: 'https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-1.webp',
    name: 'Deja Brady',
    action: 'sent you a friend request',
    time: '20 minutes',
    category: 'Communication',
    unread: true,
    showActions: 'friend_request',
  },
  {
    id: '2',
    avatar: 'https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-2.webp',
    name: 'Jayvon Hull',
    action: 'mentioned you in Minimal UI',
    time: 'a day',
    category: 'Project UI',
    unread: true,
    message: '@Jaydon Frankie feedback by asking questions or just leave a note of appreciation.',
    showActions: 'reply',
  },
  {
    id: '3',
    avatar: 'https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-3.webp',
    name: 'Lainey Davidson',
    action: 'added file to File manager',
    time: '2 days',
    category: 'File manager',
    unread: true,
    file: { name: 'design-suriname-2015.mp3', size: '2.3 Mb' },
  },
  {
    id: '4',
    avatar: 'https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-4.webp',
    name: 'Angelique Morse',
    action: 'added new tags to File manager',
    time: '3 days',
    category: 'File manager',
    tags: ['Design', 'Dashboard', 'Design system'],
  },
]

export function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'all' | 'unread' | 'archived'>('all')

  const counts = { all: 22, unread: 12, archived: 10 }

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute right-0 top-0 h-full w-[420px] bg-white shadow-2xl overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="Mark all as read">
              ✓
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="Settings">
              ⚙
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-6 pb-4">
          <button
            onClick={() => setTab('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
              tab === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            All
            <span className="text-xs bg-gray-200 text-gray-700 rounded-full px-1.5">{counts.all}</span>
          </button>
          <button
            onClick={() => setTab('unread')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${
              tab === 'unread' ? 'border-gray-900 text-gray-900' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            Unread
            <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-1.5">{counts.unread}</span>
          </button>
          <button
            onClick={() => setTab('archived')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
              tab === 'archived' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Archived
            <span className="text-xs bg-gray-200 text-gray-700 rounded-full px-1.5">{counts.archived}</span>
          </button>
        </div>

        {/* List */}
        <div className="divide-y divide-gray-100">
          {notifications.map((n) => (
            <div key={n.id} className="relative px-6 py-4 hover:bg-gray-50">
              {n.unread && <span className="absolute right-6 top-5 w-2 h-2 rounded-full bg-blue-500" />}
              <div className="flex gap-3">
                <div className="relative w-10 h-10 shrink-0 rounded-full overflow-hidden">
                  <Image src={n.avatar} alt={n.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">
                    <span className="font-semibold">{n.name}</span> {n.action}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {n.time} · {n.category}
                  </p>

                  {n.message && (
                    <div className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">{n.message}</div>
                  )}

                  {n.file && (
                    <div className="mt-2 flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2">
                      <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                        🎵
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{n.file.name}</p>
                        <p className="text-xs text-gray-400">{n.file.size}</p>
                      </div>
                      <button className="text-sm font-medium border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                        Download
                      </button>
                    </div>
                  )}

                  {n.tags && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {n.tags.map((tag, i) => (
                        <span
                          key={i}
                          className={`text-xs font-medium rounded-md px-2 py-1 ${
                            i === 0
                              ? 'bg-blue-50 text-blue-600'
                              : i === 1
                              ? 'bg-orange-50 text-orange-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {n.showActions === 'friend_request' && (
                    <div className="mt-2 flex gap-2">
                      <button className="text-sm font-medium bg-gray-900 text-white rounded-lg px-4 py-1.5 hover:bg-gray-800">
                        Accept
                      </button>
                      <button className="text-sm font-medium border border-gray-200 rounded-lg px-4 py-1.5 hover:bg-gray-50">
                        Decline
                      </button>
                    </div>
                  )}

                  {n.showActions === 'reply' && (
                    <button className="mt-2 text-sm font-medium bg-gray-900 text-white rounded-lg px-4 py-1.5 hover:bg-gray-800">
                      Reply
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-5 text-center">
          <button className="text-sm font-semibold text-gray-900 hover:underline">View all</button>
        </div>
      </div>
    </div>
  )
}