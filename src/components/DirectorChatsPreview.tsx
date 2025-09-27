import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DirectorChatsPreviewProps {
  emptyDataMode?: boolean;
}

const DirectorChatsPreview = ({ emptyDataMode }: DirectorChatsPreviewProps) => {
  const navigate = useNavigate();

  const recentChats = [
    {
      id: 1,
      subject: 'Poor comms from Encore',
      lastMessage: 'I agree, we need to address this urgently...',
      lastMessageDate: '2024-01-28 16:20',
      messageCount: 8,
      hasNewMessages: true
    },
    {
      id: 2,
      subject: 'AGM Preparations 2024',
      lastMessage: 'The venue is confirmed for March 15th...',
      lastMessageDate: '2024-01-27 14:45',
      messageCount: 12,
      hasNewMessages: false
    },
    {
      id: 3,
      subject: 'Lift Maintenance Contract',
      lastMessage: 'The new quote looks reasonable...',
      lastMessageDate: '2024-01-26 10:30',
      messageCount: 5,
      hasNewMessages: true
    }
  ];

  if (emptyDataMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Director Chats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No director conversations yet
            </p>
            <Button onClick={() => navigate('/?section=governance')}>
              Start First Discussion
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Director Chats
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/?section=governance')}
            className="flex items-center gap-1"
          >
            View All
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentChats.map((chat) => (
            <div 
              key={chat.id}
              className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => navigate('/?section=governance')}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm text-gray-900">{chat.subject}</h4>
                    {chat.hasNewMessages && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <MessageCircle className="h-3 w-3 text-blue-500" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{chat.lastMessage}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {chat.lastMessageDate}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {chat.messageCount}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DirectorChatsPreview;