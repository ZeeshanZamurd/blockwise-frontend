import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Users, FileText, Video, Archive, Loader2 } from 'lucide-react';
import { useMeeting, Meeting } from '@/hooks/useMeeting';
import { toast } from 'sonner';

interface MeetingsSectionProps {
  emptyDataMode?: boolean;
}

const MeetingsSection = ({ emptyDataMode }: MeetingsSectionProps) => {
  const { meetings, isLoading, error, fetchMeetings, createMeeting } = useMeeting();
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [clickedMeetingId, setClickedMeetingId] = useState<number | null>(null);
  const [newMeetingData, setNewMeetingData] = useState({
    title: '',
    type: '',
    date: '',
    time: '',
    location: '',
    attendees: '',
    notes: '',
    addToCalendar: false
  });

  // Fetch meetings when component mounts
  useEffect(() => {
    const loadMeetings = async () => {
      const result = await fetchMeetings();
      if (!result.success) {
        console.error('Failed to fetch meetings:', result.error);
        toast.error('Failed to load meetings');
      }
    };

    if (!emptyDataMode) {
      loadMeetings();
    }
  }, [emptyDataMode, fetchMeetings]);

  if (emptyDataMode) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <Archive className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Meetings & AGMs</h2>
          <p className="text-muted-foreground mb-6">
            Organize board meetings, AGMs, and resident assemblies
          </p>
          <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold mb-3">What you'll see here:</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Meeting scheduling and agenda management</li>
              <li>• Board resolutions and voting records</li>
              <li>• Annual General Meeting organization</li>
              <li>• Meeting minutes and documentation</li>
              <li>• Resident participation tracking</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const handleScheduleMeeting = async () => {
    if (newMeetingData.title && newMeetingData.type && newMeetingData.date && newMeetingData.time) {
      const meetingData = {
        title: newMeetingData.title,
        type: newMeetingData.type,
        date: newMeetingData.date,
        time: newMeetingData.time,
        attendees: newMeetingData.attendees.split('\n').filter(name => name.trim()),
        status: 'Scheduled',
        notes: newMeetingData.notes,
        transcript: null,
        videoUrl: null
      };

      const result = await createMeeting(meetingData);
      
      if (result.success) {
        toast.success('Meeting scheduled successfully!');
        
        // Add to calendar if checkbox is checked
        if (newMeetingData.addToCalendar) {
          const calendarEvent = {
            id: Date.now(),
            title: newMeetingData.title,
            date: newMeetingData.date,
            time: newMeetingData.time,
            type: 'meeting',
            location: newMeetingData.location,
            description: newMeetingData.notes,
            contact: 'Meeting Organizer'
          };

          // Store in localStorage for calendar component
          const existingEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
          existingEvents.push(calendarEvent);
          localStorage.setItem('calendarEvents', JSON.stringify(existingEvents));

          // Dispatch custom event to notify calendar component
          window.dispatchEvent(new CustomEvent('calendarEventAdded', { detail: calendarEvent }));
        }

        // Reset form
        setNewMeetingData({
          title: '',
          type: '',
          date: '',
          time: '',
          location: '',
          attendees: '',
          notes: '',
          addToCalendar: false
        });
      } else {
        toast.error('Failed to schedule meeting');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case 'Scheduled':
        return <Badge className="bg-blue-100 text-blue-700">Scheduled</Badge>;
      case 'Cancelled':
        return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString();
  };

  const formatTime = (time: string | null) => {
    if (!time) return 'TBD';
    return time;
  };

  const formatAttendees = (attendees: string[] | null) => {
    if (!attendees || attendees.length === 0) return 'TBD';
    return attendees.join(', ');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Meetings & AGMs</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading meetings...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Meetings & AGMs</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading meetings: {error}</p>
            <Button onClick={() => fetchMeetings()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Meetings & AGMs</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add a new meeting</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Meeting</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="meeting-title">Meeting Title</Label>
                  <Input 
                    id="meeting-title" 
                    placeholder="Enter meeting title"
                    value={newMeetingData.title}
                    onChange={(e) => setNewMeetingData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="meeting-type">Meeting Type</Label>
                  <Select value={newMeetingData.type} onValueChange={(value) => setNewMeetingData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AGM">AGM</SelectItem>
                      <SelectItem value="Board Meeting">Board Meeting</SelectItem>
                      <SelectItem value="Committee Meeting">Committee Meeting</SelectItem>
                      <SelectItem value="General Meeting">General Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="meeting-date">Date</Label>
                  <Input 
                    id="meeting-date" 
                    type="date"
                    value={newMeetingData.date}
                    onChange={(e) => setNewMeetingData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="meeting-time">Time</Label>
                  <Input 
                    id="meeting-time" 
                    type="time"
                    value={newMeetingData.time}
                    onChange={(e) => setNewMeetingData(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="meeting-location">Location</Label>
                <Input 
                  id="meeting-location" 
                  placeholder="Meeting location"
                  value={newMeetingData.location}
                  onChange={(e) => setNewMeetingData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="meeting-attendees">Attendees</Label>
                <Textarea 
                  id="meeting-attendees" 
                  placeholder="Enter attendee names, one per line"
                  value={newMeetingData.attendees}
                  onChange={(e) => setNewMeetingData(prev => ({ ...prev, attendees: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="meeting-notes">Meeting Notes/Agenda</Label>
                <Textarea 
                  id="meeting-notes" 
                  placeholder="Enter agenda items or meeting notes"
                  value={newMeetingData.notes}
                  onChange={(e) => setNewMeetingData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="meeting-documents">Upload Documents</Label>
                <Input id="meeting-documents" type="file" multiple accept=".pdf,.doc,.docx" />
                <p className="text-sm text-muted-foreground mt-1">Upload agenda, supporting documents, etc.</p>
              </div>

              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="add-to-calendar" 
                  className="rounded"
                  checked={newMeetingData.addToCalendar}
                  onChange={(e) => setNewMeetingData(prev => ({ ...prev, addToCalendar: e.target.checked }))}
                />
                <Label htmlFor="add-to-calendar">Add to building calendar</Label>
              </div>

              <div className="flex space-x-2">
                <Button className="flex-1" onClick={handleScheduleMeeting}>Schedule Meeting</Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Meetings</TabsTrigger>
          <TabsTrigger value="agm">AGMs</TabsTrigger>
          <TabsTrigger value="board">Board Meetings</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {meetings.map((meeting) => (
              <Dialog key={meeting.id}>
                <DialogTrigger asChild>
                  <Card 
                    className={`hover:shadow-md transition-all cursor-pointer ${
                      clickedMeetingId === meeting.id 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedMeeting(meeting);
                      setClickedMeetingId(meeting.id);
                    }}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{meeting.title}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(meeting.date)} at {formatTime(meeting.time)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {meeting.attendees ? meeting.attendees.length : 0} attendees
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{meeting.type}</Badge>
                          {getStatusBadge(meeting.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {meeting.transcript && (
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              Transcript available
                            </div>
                          )}
                          {meeting.videoUrl && (
                            <div className="flex items-center gap-1">
                              <Video className="h-4 w-4" />
                              Recording available
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{selectedMeeting?.title}</DialogTitle>
                  </DialogHeader>
                  {selectedMeeting && (
                    <div className="space-y-6">
                      {/* Meeting Overview */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold mb-2">Meeting Details</h3>
                          <div className="space-y-1 text-sm">
                            <p><strong>Type:</strong> {selectedMeeting.type}</p>
                            <p><strong>Date:</strong> {formatDate(selectedMeeting.date)}</p>
                            <p><strong>Time:</strong> {formatTime(selectedMeeting.time)}</p>
                            <p><strong>Status:</strong> {selectedMeeting.status}</p>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Attendees</h3>
                          <div className="space-y-1">
                            {selectedMeeting.attendees && selectedMeeting.attendees.length > 0 ? (
                              selectedMeeting.attendees.map((attendee, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <Users className="h-3 w-3" />
                                  {attendee}
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500">No attendees specified</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {selectedMeeting.notes && (
                        <div>
                          <h3 className="font-semibold mb-2">Meeting Notes</h3>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm">{selectedMeeting.notes}</p>
                          </div>
                        </div>
                      )}

                      {/* Transcript */}
                      {selectedMeeting.transcript && (
                        <div>
                          <h3 className="font-semibold mb-2">Transcript</h3>
                          <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                            <p className="text-sm whitespace-pre-wrap">{selectedMeeting.transcript}</p>
                          </div>
                        </div>
                      )}

                      {/* Video */}
                      {selectedMeeting.videoUrl && (
                        <div>
                          <h3 className="font-semibold mb-2">Recording</h3>
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            <a 
                              href={selectedMeeting.videoUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              View meeting recording
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="agm">
          <div className="grid gap-4">
            {meetings.filter(m => m.type.toLowerCase().includes('agm')).map((meeting) => (
              <Card key={meeting.id}>
                <CardHeader>
                  <CardTitle>{meeting.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{formatDate(meeting.date)} at {formatTime(meeting.time)}</p>
                  <div className="mt-2">
                    {getStatusBadge(meeting.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="board">
          <div className="grid gap-4">
            {meetings.filter(m => m.type.toLowerCase().includes('board') || m.type.toLowerCase().includes('meeting')).map((meeting) => (
              <Card key={meeting.id}>
                <CardHeader>
                  <CardTitle>{meeting.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{formatDate(meeting.date)} at {formatTime(meeting.time)}</p>
                  <div className="mt-2">
                    {getStatusBadge(meeting.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default MeetingsSection;