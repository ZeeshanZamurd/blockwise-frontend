
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { User, Send, AtSign } from 'lucide-react';
import { useComment } from '@/hooks/useComment';
import { useDirector } from '@/hooks/useDirector';
import { useBuilding } from '@/hooks/useBuilding';
import MentionPopup from './MentionPopup';
import { toast } from 'sonner';

interface DirectorCommentsProps {
  directorComments?: DirectorComment[];
  issueId?: string | number;
  onCommentAdded?: () => void; // Callback to notify parent of new comment
}

interface DirectorComment {
  id: number;
  directorName?: string;
  directorUsername?: string;
  comment?: string;
  createdDate?: string;
  // Default format fields
  author?: string;
  date?: string;
  isPrivate?: boolean;
}

interface Director {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  roleName: string;
}

const DirectorComments: React.FC<DirectorCommentsProps> = ({ 
  directorComments = [], 
  issueId, 
  onCommentAdded 
}) => {
  const { postComment } = useComment();
  const { getDirectorsByBuildingId, isLoading: isLoadingDirectors } = useDirector();
  const { building } = useBuilding();
  const [newComment, setNewComment] = useState('');
  const [localComments, setLocalComments] = useState<DirectorComment[]>([]);
  const [isPostingComment, setIsPostingComment] = useState(false);
  
  // Mention functionality state
  const [directors, setDirectors] = useState<Director[]>([]);
  const [showMentionPopup, setShowMentionPopup] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [mentionSearchTerm, setMentionSearchTerm] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Clear local comments when API comments are available to prevent duplication
  useEffect(() => {
    if (directorComments.length > 0) {
      setLocalComments([]);
    }
  }, [directorComments.length]);
  
  // Fetch directors when component mounts
  useEffect(() => {
    const fetchDirectors = async () => {
      if (building?.buildingId) {
        const result = await getDirectorsByBuildingId(building.buildingId);
        if (result.success) {
          setDirectors(result.directors);
        } else {
          console.error('Failed to fetch directors:', result.error);
        }
      }
    };
    
    fetchDirectors();
  }, [building?.buildingId, getDirectorsByBuildingId]);
  
  const defaultComments: DirectorComment[] = [
    // {
    //   id: 1,
    //   author: 'Sarah Wilson (Director)',
    //   date: '2024-06-26 10:15',
    //   comment: 'This is critical for building safety compliance. @mike.thompson should we review our maintenance contract terms?',
    //   isPrivate: false
    // },
    // {
    //   id: 2,
    //   author: 'Mike Thompson (Director)',
    //   date: '2024-06-26 18:30',
    //   comment: '@sarah.wilson Agreed. I\'ll check the contract terms tomorrow. We should also consider a backup contractor for emergencies.',
    //   isPrivate: false
    // }
  ];

  // Use API director comments if available, otherwise fallback to default
  // Only use localComments if there are no API comments to avoid duplication
  const allComments = directorComments.length > 0 ? directorComments : [...defaultComments, ...localComments];

  // Handle mention functionality
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    setNewComment(value);
    
    // Check for @ mention
    const textBeforeCursor = value.substring(0, cursorPosition);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(atIndex + 1);
      const hasSpaceAfterAt = textAfterAt.includes(' ');
      
      if (!hasSpaceAfterAt) {
        // Show mention popup
        setMentionStartIndex(atIndex);
        setMentionSearchTerm(textAfterAt);
        setShowMentionPopup(true);
        
        // Calculate popup position
        if (textareaRef.current) {
          const rect = textareaRef.current.getBoundingClientRect();
          setMentionPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX
          });
        }
      } else {
        setShowMentionPopup(false);
      }
    } else {
      setShowMentionPopup(false);
    }
  };

  const handleSelectDirector = (director: Director) => {
    if (mentionStartIndex !== -1) {
      const beforeMention = newComment.substring(0, mentionStartIndex);
      const afterMention = newComment.substring(mentionStartIndex + 1 + mentionSearchTerm.length);
      const mentionText = `@${director.username}`;
      
      setNewComment(beforeMention + mentionText + afterMention);
      setShowMentionPopup(false);
      setMentionStartIndex(-1);
      setMentionSearchTerm('');
      
      // Focus back to textarea
      if (textareaRef.current) {
        const newCursorPosition = beforeMention.length + mentionText.length;
        setTimeout(() => {
          textareaRef.current?.setSelectionRange(newCursorPosition, newCursorPosition);
          textareaRef.current?.focus();
        }, 0);
      }
    }
  };

  const handleCloseMentionPopup = () => {
    setShowMentionPopup(false);
    setMentionStartIndex(-1);
    setMentionSearchTerm('');
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    
    if (!issueId) {
      toast.error('Issue ID is required to post a comment');
      return;
    }
    
    setIsPostingComment(true);
    
    try {
      // For now, using a hardcoded directorId - in a real app, this would come from user context
 // This should come from user authentication context
      
      const result = await postComment({
        issueId: typeof issueId === 'string' ? parseInt(issueId) : issueId,
        comment: newComment.trim()
      });
      
      if (result.success) {
        // Add the comment to local state immediately for better UX
        const comment: DirectorComment = {
          id: result.comment.id || Date.now(),
          directorName: result.comment.directorName || 'Current Director',
          directorUsername: result.comment.directorUsername || '',
          comment: result.comment.comment,
          createdDate: result.comment.createdDate || new Date().toISOString(),
          author: result.comment.directorName || 'Current Director',
          date: result.comment.createdDate || new Date().toLocaleString('en-GB', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          isPrivate: false
        };
        
        setLocalComments([...localComments, comment]);
        setNewComment('');
        toast.success('Comment posted successfully');
        
        // Notify parent component
        if (onCommentAdded) {
          onCommentAdded();
        }
      } else {
        toast.error(`Failed to post comment: ${result.error}`);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Error posting comment');
    } finally {
      setIsPostingComment(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Director Comments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start space-x-2 mb-4">
          <Textarea
            ref={textareaRef}
            placeholder="Add a comment... Use @username to mention other directors"
            value={newComment}
            onChange={handleTextareaChange}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                addComment();
              }
              if (e.key === 'Escape') {
                handleCloseMentionPopup();
              }
            }}
            disabled={isPostingComment}
          />
          <Button 
            onClick={addComment} 
            size="sm"
            disabled={isPostingComment || !newComment.trim()}
          >
            {isPostingComment ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          <AtSign className="h-3 w-3 inline mr-1" />
          Use @ to mention other directors
        </p>
        
        <div className="space-y-4">
          {[...allComments].reverse().map((comment, index) => {
            // Handle API format vs default format
            const isApiFormat = comment.directorName;
            const displayData = isApiFormat ? {
              id: comment.id,
              author: comment.directorName,
              username: comment.directorUsername,
              comment: comment.comment,
              date: comment.createdDate,
              isPrivate: false
            } : {
              id: comment.id,
              author: comment.author,
              username: '',
              comment: comment.comment,
              date: comment.date,
              isPrivate: comment.isPrivate || false
            };

            // For demo purposes, mark first comment as new
            const isNewComment = index === 0;
            return (
              <div key={displayData.id} className={`p-3 rounded-lg border ${
                isNewComment 
                  ? "bg-blue-50 border-blue-200" 
                  : "bg-gray-50 border-transparent"
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{displayData.author}</span>
                    {displayData.username && (
                      <span className="text-xs text-gray-500">(@{displayData.username})</span>
                    )}
                    {displayData.isPrivate && (
                      <Badge variant="outline" className="text-xs">Private</Badge>
                    )}
                    {isNewComment && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">New</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {displayData.date ? new Date(displayData.date).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{displayData.comment}</p>
              </div>
            );
          })}
        </div>
        
        {/* Mention Popup */}
        {showMentionPopup && (
          <MentionPopup
            directors={directors}
            onSelectDirector={handleSelectDirector}
            onClose={handleCloseMentionPopup}
            position={mentionPosition}
            searchTerm={mentionSearchTerm}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default DirectorComments;
