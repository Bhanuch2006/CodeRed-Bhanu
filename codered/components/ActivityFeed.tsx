'use client';

import React, { useEffect, useRef } from 'react';
import { ActivityLog } from '@/lib/types';
import Card from './ui/Card';

interface ActivityFeedProps {
  activities: ActivityLog[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [activities]);

  const getActivityIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'join': return '➕';
      case 'leave': return '➖';
      case 'buzz': return '🔔';
      case 'vote': return '🗳️';
      case 'round-start': return '🎮';
      case 'round-end': return '🏁';
      default: return '📝';
    }
  };

  const getActivityColor = (type: ActivityLog['type']) => {
    switch (type) {
      case 'join': return 'text-green-400';
      case 'leave': return 'text-red-400';
      case 'buzz': return 'text-yellow-400';
      case 'vote': return 'text-blue-400';
      case 'round-start': return 'text-purple-400';
      case 'round-end': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Card>
      <h3 className="text-xl font-bold mb-4">Activity Feed</h3>
      <div ref={feedRef} className="space-y-2 max-h-64 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No activity yet...</p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-2 p-2 rounded bg-gray-800 hover:bg-gray-750 transition-colors"
            >
              <span className="text-xl">{getActivityIcon(activity.type)}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${getActivityColor(activity.type)}`}>
                  <span className="font-semibold">{activity.playerName}</span>
                  {' '}
                  {activity.message}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
