import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, Send, MessageCircle, Plus, Clock, Hash, Paperclip, Mic } from 'lucide-react';

interface ChatMessage {
  id: number;
  author: string;
  date: string;
  message: string;
}

interface Channel {
  id: number;
  name: string;
  hasNewMessages: boolean;
  messageCount: number;
  lastMessage?: string;
  lastMessageDate?: string;
  messages: ChatMessage[];
}

interface DirectorChatProps {
  emptyDataMode?: boolean;
}

const DirectorChat = ({ emptyDataMode }: DirectorChatProps) => {
  const [channels, setChannels] = useState<Channel[]>([
    {
      id: 1,
      name: 'All Alto Chat',
      hasNewMessages: false,
      messageCount: 15,
      lastMessage: 'The contractor confirmed they can start Monday.',
      lastMessageDate: '2024-08-30 16:45',
      messages: [
        {
          id: 1,
          author: 'Sarah Mitchell',
          date: 'Monday, August 26th - 9:15 AM',
          message: 'Good morning everyone. I\'ve reviewed the roof repair quotes we received last week. The contractor from BuildSafe Solutions seems most competitive and has excellent references.'
        },
        {
          id: 2,
          author: 'James Thompson',
          date: 'Monday, August 26th - 11:30 AM',
          message: 'Agreed on BuildSafe. I\'ve also checked their insurance coverage and certifications - all valid. Should we proceed with scheduling?'
        },
        {
          id: 3,
          author: 'Maria Rodriguez',
          date: 'Tuesday, August 27th - 2:15 PM',
          message: 'Budget-wise we\'re fine to proceed. The maintenance reserve fund can cover this expense. I suggest we aim for completion before the autumn rains.'
        },
        {
          id: 4,
          author: 'David Chen',
          date: 'Wednesday, August 28th - 4:20 PM',
          message: 'I\'ve spoken with BuildSafe this afternoon. They can start Monday and estimate 3-4 days for completion, weather permitting.'
        },
        {
          id: 5,
          author: 'Sarah Mitchell',
          date: 'Friday, August 30th - 4:45 PM',
          message: 'Perfect timing David. The contractor confirmed they can start Monday. I\'ll send out a building notice to all residents this weekend.'
        }
      ]
    },
    {
      id: 2,
      name: 'Fire Safety',
      hasNewMessages: true,
      messageCount: 8,
      lastMessage: 'The quarterly inspection is due next week...',
      lastMessageDate: '2024-08-25 16:30',
      messages: [
        {
          id: 1,
          author: 'John Smith',
          date: 'Monday, August 25th - 2:15 PM',
          message: 'Reminder that our quarterly fire safety inspection is scheduled for next week. Has everyone received the notification?'
        },
        {
          id: 2,
          author: 'Sarah Johnson',
          date: 'Monday, August 25th - 4:30 PM',
          message: 'Yes, received it. The quarterly inspection is due next week. I\'ll coordinate with the fire safety contractor.'
        }
      ]
    },
    {
      id: 3,
      name: 'AGM',
      hasNewMessages: false,
      messageCount: 12,
      lastMessage: 'Great work on the preparation documents...',
      lastMessageDate: '2024-08-24 11:45',
      messages: [
        {
          id: 1,
          author: 'Emily Davis',
          date: 'Friday, August 23rd - 9:00 AM',
          message: 'AGM preparation update: I\'ve finalized the agenda and sent it to all directors for review. Please provide feedback by end of week.'
        },
        {
          id: 2,
          author: 'Michael Brown',
          date: 'Saturday, August 24th - 11:45 AM',
          message: 'Great work on the preparation documents. Financial report is ready for presentation. Should we schedule a pre-AGM meeting?'
        }
      ]
    },
    {
      id: 4,
      name: 'Encore',
      hasNewMessages: true,
      messageCount: 6,
      lastMessage: 'Still no response to our latest emails...',
      lastMessageDate: '2024-08-26 09:15',
      messages: [
        {
          id: 1,
          author: 'John Smith',
          date: 'Monday, August 26th - 9:15 AM',
          message: 'Still no response to our latest emails regarding the heating system issues. This is becoming unacceptable. We need to escalate this matter.'
        }
      ]
    }
  ]);

  const [selectedChannel, setSelectedChannel] = useState<Channel>(channels[0]);
  const [newMessage, setNewMessage] = useState('');
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');

  if (emptyDataMode) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Director Chat</h2>
          <p className="text-muted-foreground mb-6">
            Communicate with fellow board members
          </p>
          <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold mb-3">What you'll see here:</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Channel-based conversations between directors</li>
              <li>• Real-time messaging and updates</li>
              <li>• Organized discussions by topic</li>
              <li>• File sharing and voice notes</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChannel) return;
    
    const message: ChatMessage = {
      id: Date.now(),
      author: 'Current Director',
      date: new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) + ' - ' + new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      message: newMessage
    };
    
    setChannels(channels.map(channel =>
      channel.id === selectedChannel.id
        ? {
            ...channel,
            messages: [...channel.messages, message],
            messageCount: channel.messageCount + 1,
            lastMessage: newMessage.substring(0, 50) + (newMessage.length > 50 ? '...' : ''),
            lastMessageDate: new Date().toISOString().slice(0, 16).replace('T', ' ')
          }
        : channel
    ));
    
    setSelectedChannel({
      ...selectedChannel,
      messages: [...selectedChannel.messages, message]
    });
    
    setNewMessage('');
  };

  const selectChannel = (channel: Channel) => {
    // Mark as read
    setChannels(channels.map(ch =>
      ch.id === channel.id ? { ...ch, hasNewMessages: false } : ch
    ));
    setSelectedChannel(channel);
  };

  const createNewChannel = () => {
    if (!newChannelName.trim()) return;
    
    const newChannel: Channel = {
      id: Date.now(),
      name: newChannelName,
      hasNewMessages: false,
      messageCount: 0,
      messages: []
    };
    
    setChannels([...channels, newChannel]);
    setNewChannelName('');
    setShowNewChannel(false);
    setSelectedChannel(newChannel);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Director Chat</h1>
      </div>

      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
        {/* Left Side - Channels */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Channels
              </div>
              <Button onClick={() => setShowNewChannel(true)} size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Channel
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[600px] overflow-y-auto">
              <div className="space-y-1 p-4">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChannel?.id === channel.id
                        ? 'bg-blue-100 border-blue-300'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => selectChannel(channel)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="h-4 w-4 text-gray-500" />
                      <h4 className="font-medium text-gray-900 text-sm">{channel.name}</h4>
                      {channel.hasNewMessages && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                    {channel.lastMessage && (
                      <>
                        <p className="text-xs text-gray-600 mb-1">{channel.lastMessage}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {channel.lastMessageDate}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Side - Chat View */}
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              {selectedChannel?.name || 'Select a channel'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {selectedChannel ? (
              <div className="h-[600px] flex flex-col">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {selectedChannel.messages.map((message, index) => {
                    const showDateHeader = index === 0 || 
                      message.date.split(' - ')[0] !== selectedChannel.messages[index - 1]?.date.split(' - ')[0];
                    
                    return (
                      <div key={message.id}>
                        {showDateHeader && (
                          <div className="text-center">
                            <div className="inline-block bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600 mb-4">
                              {message.date.split(' - ')[0]}
                            </div>
                          </div>
                        )}
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900 text-sm">{message.author}</span>
                              <span className="text-xs text-gray-500">{message.date.split(' - ')[1]}</span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{message.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Message Input at Bottom */}
                <div className="border-t p-4">
                  <div className="flex items-start space-x-2">
                    <Textarea
                      placeholder={`Message #${selectedChannel.name}...`}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 min-h-[80px] resize-none"
                      rows={3}
                    />
                    <div className="flex flex-col gap-2">
                      <Button onClick={sendMessage} size="sm">
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mic className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[600px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a channel to start chatting</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Channel Dialog */}
      <Dialog open={showNewChannel} onOpenChange={setShowNewChannel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Channel Name</label>
              <Input
                placeholder="Enter channel name..."
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewChannel(false)}>
                Cancel
              </Button>
              <Button onClick={createNewChannel}>
                Create Channel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DirectorChat;