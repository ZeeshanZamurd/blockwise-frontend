
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

interface CalendarSectionProps {
  emptyDataMode?: boolean;
}

const CalendarSection = ({ emptyDataMode }: CalendarSectionProps) => {
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [pendingEvents, setPendingEvents] = useState([
    {
      id: 1,
      title: 'Boiler Maintenance Appointment',
      date: '2024-07-05',
      time: '10:00',
      source: 'Email from BuildTech Contractors',
      description: 'Annual boiler service and safety check'
    },
    {
      id: 2,
      title: 'AGM Meeting',
      date: '2024-07-10',
      time: '19:00',
      source: 'Email from Managing Agent',
      description: 'Annual General Meeting for all residents'
    }
  ]);

  // Enhanced events with detailed information
  const events = [
    {
      id: 1,
      title: 'Cleaner - Common Areas',
      date: '2024-07-01',
      time: '09:00',
      duration: '2 hours',
      type: 'Cleaning',
      location: 'Common areas, lobby, stairwells',
      contact: 'Jo Cleaners',
      contactPhone: '020 7123 4567',
      contactEmail: 'jo@jocleaners.co.uk',
      description: 'Weekly cleaning of communal spaces including mopping floors, dusting surfaces, and emptying bins',
      schedule: 'Every Monday',
      scheduleDetails: 'Weekly recurring appointment',
      contractor: 'Jo Cleaners Ltd',
      cost: '£120 per visit',
      notes: 'Key holder access required. Please ensure lobby is clear of packages.'
    },
    {
      id: 2,
      title: 'Elevator Maintenance',
      date: '2024-07-02',
      time: '14:00',
      duration: '4 hours',
      type: 'Maintenance',
      location: 'Elevator shaft, machine room',
      contact: 'Thames Valley Lifts',
      contactPhone: '01865 987 654',
      contactEmail: 'service@thamesvalleylifts.com',
      description: 'Quarterly elevator inspection and maintenance including safety systems check',
      schedule: 'Every 3 months',
      scheduleDetails: 'Quarterly maintenance - next due October 2024',
      contractor: 'Thames Valley Lifts Ltd',
      cost: '£450 per service',
      notes: 'Elevator will be out of service during maintenance. Residents notified via email.'
    },
    {
      id: 3,
      title: 'Garden Maintenance',
      date: '2024-07-05',
      time: '08:30',
      duration: '3 hours',
      type: 'Gardening',
      location: 'Communal gardens, front entrance',
      contact: 'Cier Gardening',
      contactPhone: '07812 345 678',
      contactEmail: 'info@ciergardening.com',
      description: 'Fortnightly garden maintenance including hedge trimming, weeding, and lawn care',
      schedule: 'Every 2 weeks',
      scheduleDetails: 'Bi-weekly on Fridays - weather permitting',
      contractor: 'Cier Gardening Services',
      cost: '£180 per visit',
      notes: 'Weather dependent. Will reschedule if heavy rain forecast.'
    },
    {
      id: 4,
      title: 'Fire Safety Inspection',
      date: '2024-07-08',
      time: '11:00',
      duration: '2 hours',
      type: 'Safety',
      location: 'Entire building - all floors',
      contact: 'Fire Safety Compliance Ltd',
      contactPhone: '020 8765 4321',
      contactEmail: 'inspections@firesafety.co.uk',
      description: 'Annual fire safety certificate inspection covering alarms, exits, and equipment',
      schedule: 'Annually',
      scheduleDetails: 'Annual inspection - certificate expires July 2025',
      contractor: 'Fire Safety Compliance Ltd',
      cost: '£350 annual inspection',
      notes: 'Inspector will need access to all areas. Please inform residents.'
    },
    {
      id: 5,
      title: 'Window Cleaning',
      date: '2024-07-12',
      time: '09:00',
      duration: '4 hours',
      type: 'Cleaning',
      location: 'All external windows',
      contact: 'Crystal Clear Windows',
      contactPhone: '07901 234 567',
      contactEmail: 'bookings@crystalclear.co.uk',
      description: 'Bi-monthly professional window cleaning service for all external windows',
      schedule: 'Every 2 months',
      scheduleDetails: 'Bi-monthly service - next due September 2024',
      contractor: 'Crystal Clear Window Services',
      cost: '£280 per visit',
      notes: 'Weather dependent. Internal windows cleaned annually on request.'
    },
    {
      id: 6,
      title: 'Boiler Service',
      date: '2024-07-15',
      time: '10:00',
      duration: '3 hours',
      type: 'Maintenance',
      location: 'Boiler room, basement',
      contact: 'BuildTech Contractors',
      contactPhone: '020 7456 7890',
      contactEmail: 'service@buildtech.co.uk',
      description: 'Annual boiler service and gas safety check for communal heating system',
      schedule: 'Annually',
      scheduleDetails: 'Annual service - gas safety certificate due',
      contractor: 'BuildTech Contractors Ltd',
      cost: '£520 annual service',
      notes: 'Hot water may be disrupted during service. 24hr notice given to residents.'
    },
    {
      id: 7,
      title: 'CCTV System Check',
      date: '2024-07-18',
      time: '14:30',
      duration: '1.5 hours',
      type: 'Security',
      location: 'All camera locations, control room',
      contact: 'Secure Vision Systems',
      contactPhone: '020 8123 9876',
      contactEmail: 'maintenance@securevision.co.uk',
      description: 'Quarterly CCTV system maintenance and recording equipment check',
      schedule: 'Every 3 months',
      scheduleDetails: 'Quarterly maintenance - system upgrade due 2025',
      contractor: 'Secure Vision Systems Ltd',
      cost: '£180 per service',
      notes: 'Brief system downtime possible during testing.'
    }
  ];

  const getEventTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cleaning': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'safety': return 'bg-red-100 text-red-800';
      case 'gardening': return 'bg-green-100 text-green-800';
      case 'meeting': return 'bg-purple-100 text-purple-800';
      case 'security': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const confirmPendingEvent = (eventId: number) => {
    const pendingEvent = pendingEvents.find(e => e.id === eventId);
    if (pendingEvent) {
      setPendingEvents(prev => prev.filter(e => e.id !== eventId));
    }
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
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
                <Input id="title" placeholder="Enter event title" />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="gardening">Gardening</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Enter event description" />
              </div>
              <div className="flex space-x-2">
                <Button className="flex-1">Save Event</Button>
                <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>Cancel</Button>
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
          <p className="text-sm text-gray-600">Important upcoming events and deadlines</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card 
              className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-red-500"
              onClick={() => handleEventClick(events.find(e => e.type === 'Safety'))}
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <h4 className="font-medium text-gray-900">Fire Safety Inspection</h4>
                  <p className="text-sm text-gray-600">July 8th</p>
                  <Badge className="bg-red-100 text-red-800 text-xs">Critical</Badge>
                </div>
              </div>
            </Card>
            
            <Card 
              className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500"
              onClick={() => handleEventClick(events.find(e => e.title.includes('Boiler')))}
            >
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-5 w-5 text-blue-500" />
                <div>
                  <h4 className="font-medium text-gray-900">Boiler Service</h4>
                  <p className="text-sm text-gray-600">July 15th</p>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">Maintenance</Badge>
                </div>
              </div>
            </Card>

            <Card 
              className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-green-500"
              onClick={() => handleEventClick(events.find(e => e.title.includes('Window')))}
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-medium text-gray-900">Window Cleaning</h4>
                  <p className="text-sm text-gray-600">July 12th</p>
                  <Badge className="bg-green-100 text-green-800 text-xs">Scheduled</Badge>
                </div>
              </div>
            </Card>

            <Card 
              className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-orange-500"
              onClick={() => handleEventClick(events.find(e => e.title.includes('Elevator')))}
            >
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <h4 className="font-medium text-gray-900">Elevator Maintenance</h4>
                  <p className="text-sm text-gray-600">July 2nd</p>
                  <Badge className="bg-orange-100 text-orange-800 text-xs">Upcoming</Badge>
                </div>
              </div>
            </Card>
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
              {events.slice(0, 4).map((event) => (
                <div 
                  key={event.id} 
                  className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleEventClick(event)}
                >
                  <p className="text-xs font-medium">{event.title}</p>
                  <p className="text-xs text-gray-600">{event.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* This Month Summary */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>This Month Summary</CardTitle>
            <p className="text-sm text-gray-600">July overview</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Events</span>
                <Badge className="bg-blue-100 text-blue-800">{events.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Maintenance</span>
                <Badge className="bg-orange-100 text-orange-800">
                  {events.filter(e => e.type === 'Maintenance').length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cleaning</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {events.filter(e => e.type === 'Cleaning').length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Safety Checks</span>
                <Badge className="bg-red-100 text-red-800">
                  {events.filter(e => e.type === 'Safety').length}
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
              // Generate a month view starting from July 1, 2024
              const startDate = new Date(2024, 6, 1); // July 1, 2024
              const startDay = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1; // Convert Sunday=0 to Monday=0
              const currentDate = new Date(2024, 6, 1 - startDay + index);
              const isCurrentMonth = currentDate.getMonth() === 6; // July = 6
              const dateStr = currentDate.toISOString().split('T')[0];
              const dayEvents = events.filter(event => event.date === dateStr);
              
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
                          {event.time}
                        </div>
                        <div className="text-blue-700 leading-tight truncate">
                          {event.title}
                        </div>
                        <Badge className={`${getEventTypeColor(event.type)} text-[10px] px-1 py-0`}>
                          {event.type}
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
                    {selectedEvent.date} at {selectedEvent.time}
                  </div>
                  <div className="text-xs text-gray-500">Duration: {selectedEvent.duration}</div>
                </div>
                <div>
                  <Label>Schedule</Label>
                  <div className="text-sm text-gray-700 mt-1 flex items-center space-x-1">
                    <Repeat className="h-3 w-3" />
                    <span>{selectedEvent.schedule}</span>
                  </div>
                  <div className="text-xs text-gray-500">{selectedEvent.scheduleDetails}</div>
                </div>
              </div>

              {/* Location & Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Location</Label>
                  <div className="text-sm text-gray-700 mt-1 flex items-start space-x-1">
                    <MapPin className="h-3 w-3 mt-0.5" />
                    <span>{selectedEvent.location}</span>
                  </div>
                </div>
                <div>
                  <Label>Contact</Label>
                  <div className="text-sm text-gray-700 mt-1 space-y-1">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{selectedEvent.contact}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                      <span>{selectedEvent.contactPhone}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Mail className="h-3 w-3" />
                      <span>{selectedEvent.contactEmail}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label>Description</Label>
                <p className="text-sm text-gray-700 mt-1">{selectedEvent.description}</p>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Contractor</Label>
                  <div className="text-sm text-gray-700 mt-1">{selectedEvent.contractor}</div>
                </div>
                <div>
                  <Label>Cost</Label>
                  <div className="text-sm text-gray-700 mt-1">{selectedEvent.cost}</div>
                </div>
              </div>

              {/* Notes */}
              {selectedEvent.notes && (
                <div>
                  <Label>Notes</Label>
                  <p className="text-sm text-gray-700 mt-1 bg-yellow-50 p-2 rounded border border-yellow-200">
                    {selectedEvent.notes}
                  </p>
                </div>
              )}

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
