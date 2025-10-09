
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar as CalendarIcon, Clock, MapPin, User, Mail, AlertTriangle, Phone, Repeat, CheckCircle } from 'lucide-react';
import { useCalendar } from '@/hooks/useCalendar';

interface CalendarSectionProps {
  emptyDataMode?: boolean;
}

const CalendarSection = ({ emptyDataMode }: CalendarSectionProps) => {
  const { events, isLoading, error, fetchEvents, createEvent, forceRefresh } = useCalendar();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  
  // Form state for new event
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    type: '',
    description: ''
  });
  
  // Fetch calendar events when component mounts
  useEffect(() => {
    const loadEvents = async () => {
      const result = await fetchEvents();
      if (!result.success) {
        console.error('Failed to fetch calendar events:', result.error);
      }
    };

    if (!emptyDataMode) {
      loadEvents();
    }
  }, [emptyDataMode, fetchEvents]);
  
  if (emptyDataMode) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Calendar</h2>
          <p className="text-muted-foreground mb-6">
            Schedule and manage building events, maintenance, and meetings
          </p>
          <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold mb-3">What you'll see here:</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Maintenance scheduling and reminders</li>
              <li>• Board meetings and AGM planning</li>
              <li>• Contractor appointment booking</li>
              <li>• Resident event coordination</li>
              <li>• Certificate expiry tracking</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Calendar</h2>
            <p className="text-gray-600">Building appointments and scheduled maintenance</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span>Loading calendar events...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Calendar</h2>
            <p className="text-gray-600">Building appointments and scheduled maintenance</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading calendar: {error}</p>
            <Button onClick={() => forceRefresh()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  const getEventTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'other': return 'bg-gray-100 text-gray-800';
      case 'fire_drill': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'inspection': return 'bg-yellow-100 text-yellow-800';
      case 'community_meeting': return 'bg-blue-100 text-blue-800';
      case 'training': return 'bg-green-100 text-green-800';
      // Legacy types for backward compatibility
      case 'agm': return 'bg-purple-100 text-purple-800';
      case 'general_meeting': return 'bg-blue-100 text-blue-800';
      case 'board_meeting': return 'bg-green-100 text-green-800';
      case 'committee_meeting': return 'bg-orange-100 text-orange-800';
      case 'cleaning': return 'bg-blue-100 text-blue-800';
      case 'safety': return 'bg-red-100 text-red-800';
      case 'gardening': return 'bg-green-100 text-green-800';
      case 'meeting': return 'bg-purple-100 text-purple-800';
      case 'security': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventsForDate = (date: Date) => {
    // Format date as YYYY-MM-DD in local timezone to match API response
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    console.log('Looking for events on date:', dateStr, 'for calendar date:', date);
    const matchingEvents = events?.filter(event => {
      console.log('Comparing event date:', event.date, 'with target date:', dateStr);
      return event.date === dateStr;
    }) || [];
    
    console.log('Found events for date:', dateStr, ':', matchingEvents);
    return matchingEvents;
  };

  const getTodayEvents = () => {
    // Format today's date as YYYY-MM-DD in local timezone
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    return events?.filter(event => event.date === todayStr) || [];
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return events?.filter(event => {
      // Parse event date as local date to avoid timezone issues
      const [year, month, day] = event.date.split('-').map(Number);
      const eventDate = new Date(year, month - 1, day); // month is 0-indexed
      
      return eventDate >= today && eventDate <= nextWeek;
    }).slice(0, 4) || [];
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
  };

  const handleCreateEvent = async () => {
    // Basic validation
    if (!newEvent.title.trim()) {
      alert('Please enter an event title');
      return;
    }
    
    if (!newEvent.date) {
      alert('Please select a date');
      return;
    }
    
    if (!newEvent.time) {
      alert('Please select a time');
      return;
    }
    
    if (!newEvent.type) {
      alert('Please select an event type');
      return;
    }

    setIsCreatingEvent(true);
    try {
      console.log('Creating event with data:', newEvent);
      
      const result = await createEvent({
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time,
        type: newEvent.type,
        description: newEvent.description || ''
      });
      
      if (result.success) {
        console.log('Event created successfully:', result.event);
        alert('Event created successfully!');
        
        // Reset form and close dialog
        setNewEvent({
          title: '',
          date: '',
          time: '',
          type: '',
          description: ''
        });
        setIsAddEventOpen(false);
        
        // Refresh events list
        await fetchEvents();
      } else {
        console.error('Failed to create event:', result.error);
        alert(`Failed to create event: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setNewEvent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Calendar</h2>
          <p className="text-gray-600">Building appointments and scheduled maintenance</p>
        </div>
        <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 self-start sm:self-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input 
                  id="title" 
                  placeholder="Enter event title" 
                  value={newEvent.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={newEvent.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input 
                  id="time" 
                  type="time" 
                  value={newEvent.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={newEvent.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OTHER">Other</SelectItem>
                    <SelectItem value="FIRE_DRILL">Fire Drill</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    <SelectItem value="INSPECTION">Inspection</SelectItem>
                    <SelectItem value="COMMUNITY_MEETING">Community Meeting</SelectItem>
                    <SelectItem value="TRAINING">Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter event description" 
                  value={newEvent.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  className="flex-1" 
                  onClick={handleCreateEvent}
                  disabled={isCreatingEvent}
                >
                  {isCreatingEvent ? 'Creating...' : 'Save Event'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddEventOpen(false);
                    setNewEvent({
                      title: '',
                      date: '',
                      time: '',
                      type: '',
                      description: ''
                    });
                  }}
                  disabled={isCreatingEvent}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notable Events This Month */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <span>Notable Events This Month</span>
          </CardTitle>
          <p className="text-sm text-gray-600">Important upcoming meetings and events</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {events?.slice(0, 4).map((event, index) => (
              <Card 
                key={event.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500"
                onClick={() => handleEventClick(event)}
              >
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
                    <Badge className={`text-xs ${getEventTypeColor(event.type)}`}>
                      {event.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
            {(!events || events.length === 0) && (
              <div className="col-span-full text-center py-8 text-gray-500">
                <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No events scheduled this month</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>


      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 md:gap-6">
        {/* Calendar View */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
            <p className="text-sm text-gray-600">Click dates for events</p>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border w-full"
              modifiers={{
                hasEvents: (date) => getEventsForDate(date).length > 0
              }}
              modifiersStyles={{
                hasEvents: {
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: 'rgb(37, 99, 235)',
                  fontWeight: 'bold'
                }
              }}
            />
            <div className="mt-4 text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-100 rounded"></div>
                <span>Days with events</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Schedule */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>
              {selectedDate ? `Schedule for ${selectedDate.toLocaleDateString()}` : "Today's Schedule"}
            </CardTitle>
            <p className="text-sm text-gray-600">Events for selected date</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedDate && getEventsForDate(selectedDate).length > 0 ? (
                getEventsForDate(selectedDate).map((event) => (
                  <div 
                    key={event.id} 
                    className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleEventClick(event)}
                  >
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-gray-600">{event.time} - {event.duration}</p>
                    <Badge className={`text-xs ${getEventTypeColor(event.type)}`}>
                      {event.type}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No events scheduled</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming This Week */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Upcoming This Week</CardTitle>
            <p className="text-sm text-gray-600">Next 7 days</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getUpcomingEvents().map((event) => (
                <div 
                  key={event.id} 
                  className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleEventClick(event)}
                >
                  <p className="text-xs font-medium">{event.title}</p>
                  <p className="text-xs text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
                  <Badge className={`text-[10px] ${getEventTypeColor(event.type)}`}>
                    {event.type.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
              {getUpcomingEvents().length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No upcoming events</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* This Month Summary */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>This Month Summary</CardTitle>
            <p className="text-sm text-gray-600">Meeting overview</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Events</span>
                <Badge className="bg-blue-100 text-blue-800">{events?.length || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Fire Drills</span>
                <Badge className="bg-red-100 text-red-800">
                  {events?.filter(e => e.type === 'FIRE_DRILL').length || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Maintenance</span>
                <Badge className="bg-orange-100 text-orange-800">
                  {events?.filter(e => e.type === 'MAINTENANCE').length || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Community Meetings</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {events?.filter(e => e.type === 'COMMUNITY_MEETING').length || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Training</span>
                <Badge className="bg-green-100 text-green-800">
                  {events?.filter(e => e.type === 'TRAINING').length || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Schedule View - Grid Format */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            <span>This Month's Schedule</span>
          </CardTitle>
          <p className="text-sm text-gray-600">All appointments organized by calendar date</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {/* Header row */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            
            {/* Calendar grid */}
            {Array.from({ length: 35 }, (_, index) => {
              // Generate a month view starting from current month
              const today = new Date();
              const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
              const startDay = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1; // Convert Sunday=0 to Monday=0
              const currentDate = new Date(today.getFullYear(), today.getMonth(), 1 - startDay + index);
              const isCurrentMonth = currentDate.getMonth() === today.getMonth();
              
              // Format date as YYYY-MM-DD in local timezone
              const year = currentDate.getFullYear();
              const month = String(currentDate.getMonth() + 1).padStart(2, '0');
              const day = String(currentDate.getDate()).padStart(2, '0');
              const dateStr = `${year}-${month}-${day}`;
              
              const dayEvents = events?.filter(event => event.date === dateStr) || [];
              
              return (
                <div 
                  key={index} 
                  className={`min-h-[100px] p-1 border border-gray-200 rounded ${
                    isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <div className={`text-xs font-medium mb-1 ${
                    isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    <div className="text-center">
                      {currentDate.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-center text-sm">
                      {currentDate.getDate()}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div 
                        key={event.id} 
                        className="bg-blue-50 border border-blue-200 rounded p-1 text-xs cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="font-medium text-blue-900 leading-tight truncate">
                          {event.time || 'All Day'}
                        </div>
                        <div className="text-blue-700 leading-tight truncate">
                          {event.title}
                        </div>
                        <Badge className={`${getEventTypeColor(event.type)} text-[10px] px-1 py-0`}>
                          {event.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-blue-600 font-medium text-center py-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Event Details Modal */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedEvent.title}</span>
                <Badge className={getEventTypeColor(selectedEvent.type)}>{selectedEvent.type}</Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Date & Time</Label>
                  <div className="text-sm text-gray-700 mt-1">
                    {new Date(selectedEvent.date).toLocaleDateString()} 
                    {selectedEvent.time && ` at ${selectedEvent.time}`}
                  </div>
                  <div className="text-xs text-gray-500">
                    Status: {selectedEvent.status}
                  </div>
                </div>
                <div>
                  <Label>Meeting Type</Label>
                  <div className="text-sm text-gray-700 mt-1 flex items-center space-x-1">
                    <CalendarIcon className="h-3 w-3" />
                    <span>{selectedEvent.type.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Attendees */}
              {selectedEvent.attendees && (
                <div>
                  <Label>Attendees</Label>
                  <div className="text-sm text-gray-700 mt-1">
                    {selectedEvent.attendees}
                  </div>
                </div>
              )}

              {/* Description/Notes */}
              <div>
                <Label>Notes</Label>
                <p className="text-sm text-gray-700 mt-1 bg-yellow-50 p-2 rounded border border-yellow-200">
                  {selectedEvent.notes || 'No notes available'}
                </p>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedEvent.transcript && (
                  <div>
                    <Label>Transcript</Label>
                    <div className="text-sm text-gray-700 mt-1">
                      <a href={selectedEvent.transcript} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        View Transcript
                      </a>
                    </div>
                  </div>
                )}
                {selectedEvent.videoUrl && (
                  <div>
                    <Label>Video Recording</Label>
                    <div className="text-sm text-gray-700 mt-1">
                      <a href={selectedEvent.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Watch Video
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 pt-4">
                <Button className="flex-1">Edit Appointment</Button>
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CalendarSection;
