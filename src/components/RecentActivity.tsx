
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, AlertTriangle, FileText, Calendar, Users, MapPin, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface RecentActivityProps {
  emptyDataMode?: boolean;
}

const RecentActivity = ({ emptyDataMode = false }: RecentActivityProps) => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [viewedItems, setViewedItems] = useState<Set<number>>(new Set());

  const activities = [
    {
      id: 1,
      type: 'email',
      title: 'New repair request received',
      description: 'Elevator maintenance issue reported by resident in Flat 4B',
      timestamp: '2 hours ago',
      status: 'processed',
      category: 'Maintenance',
      isNew: true,
      issueId: 12
    },
    {
      id: 2,
      type: 'issue',
      title: 'Issue created from email',
      description: 'Roof leak in Block A - High priority issue generated',
      timestamp: '3 hours ago',
      status: 'created',
      category: 'Repairs',
      isNew: true
    },
    {
      id: 3,
      type: 'email',
      title: 'Contractor quote received',
      description: 'Quote from Roof Repair Specialists for emergency repairs',
      timestamp: '5 hours ago',
      status: 'review',
      category: 'Financial',
      isNew: false
    },
    {
      id: 4,
      type: 'calendar',
      title: 'Appointment scheduled',
      description: 'Fire safety inspection scheduled for next week',
      timestamp: '1 day ago',
      status: 'scheduled',
      category: 'Safety',
      isNew: false
    },
    {
      id: 5,
      type: 'document',
      title: 'Document uploaded',
      description: 'Gas safety certificate added to document vault',
      timestamp: '1 day ago',
      status: 'completed',
      category: 'Compliance',
      isNew: false
    },
    {
      id: 6,
      type: 'director-chat',
      title: 'Director comment on Issue #8',
      description: 'Sarah Johnson commented on "Broken intercom system"',
      timestamp: '4 hours ago',
      status: 'new',
      category: 'Communication',
      isNew: true,
      issueId: 8
    },
    {
      id: 7,
      type: 'director-chat',
      title: 'General discussion started',
      description: 'Mike Davis started discussion about "Summer maintenance schedule"',
      timestamp: '6 hours ago',
      status: 'ongoing',
      category: 'Communication',
      isNew: true
    },
    {
      id: 8,
      type: 'email',
      title: 'New resident inquiry',
      description: 'Question about parking allocation from new resident',
      timestamp: '1 hour ago',
      status: 'review',
      category: 'General',
      isNew: true
    }
  ];

  // Calculate rollup data
  const emptyActivities = emptyDataMode ? [] : activities;
  const directorChats = emptyActivities.filter(a => a.type === 'director-chat');
  const newEmails = emptyActivities.filter(a => a.type === 'email' && a.status !== 'processed');
  const processedEmails = emptyActivities.filter(a => a.type === 'email' && a.status === 'processed');
  const newIssues = emptyActivities.filter(a => a.type === 'issue' && a.status === 'created');
  const emailsNeedingReview = emptyActivities.filter(a => a.type === 'email' && a.status === 'review');

  const rollupCards = [
    {
      id: 'director-chats',
      title: 'Director Chats',
      count: directorChats.length,
      description: 'Recent communications',
      icon: Users,
      color: 'bg-purple-50 border-purple-200 text-purple-800',
      details: directorChats.map(chat => ({
        text: chat.issueId ? `Issue #${chat.issueId}: ${chat.description}` : chat.description,
        isNew: chat.isNew
      }))
    },
    {
      id: 'new-emails',
      title: 'Emails Received',
      count: newEmails.length + processedEmails.length,
      description: `${processedEmails.length} processed, ${newEmails.length} pending`,
      icon: Mail,
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      details: [...newEmails, ...processedEmails].map(email => ({
        text: email.title,
        isNew: email.isNew
      }))
    },
    {
      id: 'new-issues',
      title: 'New Issues',
      count: newIssues.length,
      description: 'Recently created',
      icon: AlertTriangle,
      color: 'bg-orange-50 border-orange-200 text-orange-800',
      details: newIssues.map(issue => ({
        text: issue.title,
        isNew: issue.isNew
      }))
    },
    {
      id: 'emails-review',
      title: 'Emails Need Review',
      count: emailsNeedingReview.length,
      description: 'Requiring attention',
      icon: FileText,
      color: 'bg-red-50 border-red-200 text-red-800',
      details: emailsNeedingReview.map(email => ({
        text: email.title,
        isNew: email.isNew
      }))
    }
  ];

  const filteredActivities = selectedFilter === 'all' 
    ? emptyActivities 
    : emptyActivities.filter(activity => {
        switch (selectedFilter) {
          case 'director-chats': return activity.type === 'director-chat';
          case 'new-emails': return activity.type === 'email';
          case 'new-issues': return activity.type === 'issue' && activity.status === 'created';
          case 'emails-review': return activity.type === 'email' && activity.status === 'review';
          default: return true;
        }
      });

  const handleItemClick = (itemId: number) => {
    setViewedItems(prev => new Set([...prev, itemId]));
  };

  const handleCardClick = (cardId: string) => {
    setSelectedFilter(cardId);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-5 w-5 text-blue-600" />;
      case 'issue': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'document': return <FileText className="h-5 w-5 text-green-600" />;
      case 'calendar': return <Calendar className="h-5 w-5 text-purple-600" />;
      case 'director-chat': return <MessageSquare className="h-5 w-5 text-purple-600" />;
      default: return <Users className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800';
      case 'created': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Recent Activity</h1>
            <p className="text-gray-600">Track all automated processing and system activities</p>
          </div>

          {/* Rollup Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {rollupCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <Card 
                  key={card.id} 
                  className={`${card.color} cursor-pointer hover:shadow-md transition-all ${selectedFilter === card.id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => handleCardClick(card.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <IconComponent className="h-6 w-6" />
                      <span className="text-2xl font-bold">{card.count}</span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{card.title}</h3>
                    <p className="text-xs opacity-80">{card.description}</p>
                    {selectedFilter === card.id && card.details.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-current/20">
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {card.details.map((detail, index) => (
                            <div 
                              key={index} 
                              className={`text-xs p-1 rounded ${detail.isNew ? 'bg-white/30 font-medium' : ''}`}
                            >
                              {detail.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Filter indicator */}
          {selectedFilter !== 'all' && (
            <div className="mb-4 flex items-center gap-2">
              <Badge variant="outline">
                Filtered: {rollupCards.find(c => c.id === selectedFilter)?.title}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedFilter('all')}
                className="text-blue-600"
              >
                Clear filter
              </Button>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Activity Feed</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredActivities.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">{emptyDataMode ? 'No activity yet' : 'No activities match this filter'}</p>
                    {emptyDataMode && <p className="text-xs text-gray-400 mt-1">Activity will appear here as emails are processed and issues are created</p>}
                  </div>
                ) : (
                  filteredActivities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className={`flex items-start space-x-4 p-4 rounded-lg cursor-pointer transition-all ${
                      activity.isNew && !viewedItems.has(activity.id)
                        ? 'bg-blue-50 border-2 border-blue-200 shadow-sm'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => handleItemClick(activity.id)}
                  >
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`text-sm font-medium text-gray-900 truncate ${
                          activity.isNew && !viewedItems.has(activity.id) ? 'font-semibold' : ''
                        }`}>
                          {activity.title}
                          {activity.isNew && !viewedItems.has(activity.id) && (
                            <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(activity.status)}>
                            {activity.status}
                          </Badge>
                          <span className="text-xs text-gray-500">{activity.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                      <Badge variant="outline" className="text-xs">
                        {activity.category}
                      </Badge>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RecentActivity;
