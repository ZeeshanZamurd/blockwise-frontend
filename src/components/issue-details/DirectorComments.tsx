
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { User, Send, AtSign } from 'lucide-react';

interface DirectorCommentsProps {
  initialComments?: any[];
}

const DirectorComments: React.FC<DirectorCommentsProps> = ({ initialComments = [] }) => {
  const [newComment, setNewComment] = useState('');
  const [directorComments, setDirectorComments] = useState(initialComments.length > 0 ? initialComments : [
    {
      id: 1,
      author: 'Sarah Wilson (Director)',
      date: '2024-06-26 10:15',
      comment: 'This is critical for building safety compliance. @mike.thompson should we review our maintenance contract terms?',
      isPrivate: false
    },
    {
      id: 2,
      author: 'Mike Thompson (Director)',
      date: '2024-06-26 18:30',
      comment: '@sarah.wilson Agreed. I\'ll check the contract terms tomorrow. We should also consider a backup contractor for emergencies.',
      isPrivate: false
    }
  ]);

  const addComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now(),
      author: 'Current Director',
      date: new Date().toLocaleString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      comment: newComment,
      isPrivate: false
    };
    
    setDirectorComments([...directorComments, comment]);
    setNewComment('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Director Comments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start space-x-2 mb-4">
          <Textarea
            placeholder="Add a comment... Use @username to mention other directors"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1"
          />
          <Button onClick={addComment} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          <AtSign className="h-3 w-3 inline mr-1" />
          Use @ to mention other directors
        </p>
        
        <div className="space-y-4">
          {[...directorComments].reverse().map((comment, index) => {
            // For demo purposes, mark first comment as new
            const isNewComment = index === 0;
            return (
              <div key={comment.id} className={`p-3 rounded-lg border ${
                isNewComment 
                  ? "bg-blue-50 border-blue-200" 
                  : "bg-gray-50 border-transparent"
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{comment.author}</span>
                    {comment.isPrivate && (
                      <Badge variant="outline" className="text-xs">Private</Badge>
                    )}
                    {isNewComment && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">New</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{comment.date}</span>
                </div>
                <p className="text-sm text-gray-700">{comment.comment}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default DirectorComments;
