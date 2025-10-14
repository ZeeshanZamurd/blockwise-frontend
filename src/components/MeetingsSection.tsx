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
import { Calendar, Users, FileText, Video, Archive, Loader2, Download, Eye } from 'lucide-react';
import { useMeeting, Meeting, CreateMeetingData } from '@/hooks/useMeeting';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface MeetingsSectionProps {
  emptyDataMode?: boolean;
}

const MeetingsSection = ({ emptyDataMode }: MeetingsSectionProps) => {
  const { meetings, isLoading, error, fetchMeetings, fetchMeetingTypes, createMeeting } = useMeeting();
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [clickedMeetingId, setClickedMeetingId] = useState<number | null>(null);
  const [meetingTypes, setMeetingTypes] = useState<string[]>([]);
  const [newMeetingData, setNewMeetingData] = useState<CreateMeetingData>({
    title: '',
    type: '',
    date: '',
    time: '',
    attendees: '',
    status: 'Scheduled',
    transcript: '',
    videoUrl: '',
    notes: '',
    file: undefined
  });

  // Fetch meetings and meeting types when component mounts
  useEffect(() => {
    const loadData = async () => {
      // Fetch meetings
      const meetingsResult = await fetchMeetings();
      if (!meetingsResult.success) {
        console.error('Failed to fetch meetings:', meetingsResult.error);
        toast.error('Failed to load meetings');
      }

      // Fetch meeting types
      const typesResult = await fetchMeetingTypes();
      if (typesResult.success) {
        setMeetingTypes(typesResult.meetingTypes);
      } else {
        console.error('Failed to fetch meeting types:', typesResult.error);
        toast.error('Failed to load meeting types');
      }
    };

    if (!emptyDataMode) {
      loadData();
    }
  }, [emptyDataMode, fetchMeetings, fetchMeetingTypes]);

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
    console.log('Form data before validation:', newMeetingData);
    
    if (!newMeetingData.title) {
      toast.error('Please enter a meeting title');
      return;
    }
    if (!newMeetingData.type) {
      toast.error('Please select a meeting type');
      return;
    }
    if (!newMeetingData.date) {
      toast.error('Please select a meeting date');
      return;
    }
    if (!newMeetingData.time) {
      toast.error('Please select a meeting time');
      return;
    }

    const meetingData: CreateMeetingData = {
      title: newMeetingData.title,
      type: newMeetingData.type,
      date: newMeetingData.date,
      time: newMeetingData.time,
      attendees: newMeetingData.attendees,
      status: newMeetingData.status,
      transcript: newMeetingData.transcript || null,
      videoUrl: newMeetingData.videoUrl || null,
      notes: newMeetingData.notes || null,
      file: newMeetingData.file
    };

    console.log('Meeting data being sent:', meetingData);

    const result = await createMeeting(meetingData);
    
    if (result.success) {
      toast.success('Meeting scheduled successfully!');
      
      // Reset form
      setNewMeetingData({
        title: '',
        type: '',
        date: '',
        time: '',
        attendees: '',
        status: 'Scheduled',
        transcript: '',
        videoUrl: '',
        notes: '',
        file: undefined
      });
    } else {
      toast.error('Failed to schedule meeting');
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

  const handleDownloadDocument = async (documentId: number) => {
    try {
      const response = await api.get(`/api/v1/document/download/${documentId}`, {
        responseType: 'blob'
      });
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `meeting-document-${documentId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Document downloaded successfully!');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const handleViewDocument = async (documentId: number) => {
    try {
      const response = await api.get(`/api/v1/document/view/${documentId}`);
      
      // The API returns an object with a URL property
      if (response.data && response.data.url) {
        // Open the document URL directly in a new tab
        window.open(response.data.url, '_blank');
        toast.success('Document opened in new tab!');
      } else {
        toast.error('No document URL found');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      toast.error('Failed to view document');
    }
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
                      {meetingTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
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
                <Label htmlFor="meeting-attendees">Attendees</Label>
                <Textarea 
                  id="meeting-attendees" 
                  placeholder="Enter attendee emails, separated by commas"
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
                <Input 
                  id="meeting-documents" 
                  type="file" 
                  accept=".pdf,.doc,.docx" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setNewMeetingData(prev => ({ ...prev, file: file }));
                  }}
                />
                <p className="text-sm text-muted-foreground mt-1">Upload agenda, supporting documents, etc.</p>
                {newMeetingData.file && (
                  <p className="text-sm text-green-600 mt-1">File selected: {newMeetingData.file.name}</p>
                )}
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
                          {meeting.documentId && (
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              Document attached
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

                      {/* Document */}
                      {selectedMeeting.documentId && (
                        <div>
                          <h3 className="font-semibold mb-2">Meeting Document</h3>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewDocument(selectedMeeting.documentId!)}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                View Document
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDownloadDocument(selectedMeeting.documentId!)}
                                className="flex items-center gap-1"
                              >
                                <Download className="h-3 w-3" />
                                Download
                              </Button>
                            </div>
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