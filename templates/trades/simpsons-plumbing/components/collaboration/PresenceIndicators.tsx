'use client';

import { PresenceUser } from '@/hooks/usePresence';

interface PresenceAvatarsProps {
  users: PresenceUser[];
  maxDisplay?: number;
}

export function PresenceAvatars({ users, maxDisplay = 5 }: PresenceAvatarsProps) {
  const displayUsers = users.slice(0, maxDisplay);
  const remainingCount = users.length - maxDisplay;

  if (users.length === 0) return null;

  return (
    <div className="flex items-center -space-x-2">
      {displayUsers.map((user) => (
        <div
          key={user.id}
          className="relative group"
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
              style={{ borderColor: user.color }}
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 transition-transform hover:scale-110"
              style={{ backgroundColor: user.color, borderColor: user.color }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          
          {/* Activity indicator */}
          {user.activity && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900 animate-pulse" />
          )}
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            {user.name}
            {user.activity && (
              <span className="text-zinc-400 ml-1">
                editing
              </span>
            )}
          </div>
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-white text-xs font-bold border-2 border-zinc-600">
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

interface TypingIndicatorProps {
  typingUsers: string[];
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  let message = '';
  if (typingUsers.length === 1) {
    message = `${typingUsers[0]} is typing...`;
  } else if (typingUsers.length === 2) {
    message = `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
  } else {
    message = `${typingUsers.length} people are typing...`;
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400">
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{message}</span>
    </div>
  );
}
