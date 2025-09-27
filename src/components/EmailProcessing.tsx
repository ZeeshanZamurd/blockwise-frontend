
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mail, CheckCircle, AlertCircle, Plus, Edit2, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react';

const EmailProcessing = () => {
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editTaskText, setEditTaskText] = useState('');
  const [showLogMultiple, setShowLogMultiple] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Mock data for emails requiring review
  const emailsRequiringReview = [
    {
      id: 1,
      subject: 'Urgent: Broken window in Flat 4B',
      from: 'resident.4b@alto.com',
      date: '2024-06-27 09:30',
      suggestedTasks: [
        { id: 1, text: 'Contact glazier for emergency repair', confirmed: false },
        { id: 2, text: 'Arrange temporary boarding if needed', confirmed: false },
        { id: 3, text: 'Check building insurance coverage', confirmed: true }
      ]
    },
    {
      id: 2,
      subject: 'Noise complaint - Flat 2A',
      from: 'resident.1b@alto.com',
      date: '2024-06-27 11:15',
      suggestedTasks: [
        { id: 4, text: 'Send noise complaint letter to Flat 2A', confirmed: false },
        { id: 5, text: 'Review lease terms regarding noise policy', confirmed: false }
      ]
    }
  ];

  const [emails, setEmails] = useState(emailsRequiringReview);

  const addTask = (emailId: number) => {
    if (!newTask.trim()) return;
    
    setEmails(emails.map(email => 
      email.id === emailId 
        ? {
            ...email,
            suggestedTasks: [
              ...email.suggestedTasks,
              { id: Date.now(), text: newTask, confirmed: false }
            ]
          }
        : email
    ));
    setNewTask('');
  };

  const editTask = (emailId: number, taskId: number) => {
    const email = emails.find(e => e.id === emailId);
    const task = email?.suggestedTasks.find(t => t.id === taskId);
    if (task) {
      setEditingTask(taskId);
      setEditTaskText(task.text);
    }
  };

  const saveEdit = (emailId: number, taskId: number) => {
    setEmails(emails.map(email => 
      email.id === emailId 
        ? {
            ...email,
            suggestedTasks: email.suggestedTasks.map(task =>
              task.id === taskId ? { ...task, text: editTaskText } : task
            )
          }
        : email
    ));
    setEditingTask(null);
    setEditTaskText('');
  };

  const removeTask = (emailId: number, taskId: number) => {
    setEmails(emails.map(email => 
      email.id === emailId 
        ? {
            ...email,
            suggestedTasks: email.suggestedTasks.filter(task => task.id !== taskId)
          }
        : email
    ));
  };

  const confirmTask = (emailId: number, taskId: number) => {
    setEmails(emails.map(email => 
      email.id === emailId 
        ? {
            ...email,
            suggestedTasks: email.suggestedTasks.map(task =>
              task.id === taskId ? { ...task, confirmed: true } : task
            )
          }
        : email
    ));
  };

  const handleLogIssues = () => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Log Multiple Issues Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <span>Log Multiple Issues</span>
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLogMultiple(!showLogMultiple)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Issues</span>
              {showLogMultiple ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        
        {showLogMultiple && (
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Successfully Processed Emails */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Processed Successfully</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600">Emails automatically converted to tasks</p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-3xl font-bold text-green-600 mb-2">47</div>
                    <p className="text-gray-600">Emails processed today</p>
                    <p className="text-sm text-gray-500 mt-2">12 new issues created, 35 updates applied</p>
                  </div>
                </CardContent>
              </Card>

              {/* Emails Requiring Review */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      <span>Require Review</span>
                    </div>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700">
                      {emails.length} pending
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600">Manual director review needed</p>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                  <div className="space-y-4">
                    {emails.map((email) => (
                      <div key={email.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{email.subject}</h4>
                            <p className="text-xs text-gray-500">From: {email.from} • {email.date}</p>
                          </div>
                          <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        
                        <Separator className="my-3" />
                        
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-gray-900">Suggested Tasks:</h5>
                          {email.suggestedTasks.map((task) => (
                            <div key={task.id} className="flex items-center justify-between p-2 bg-white rounded border">
                              {editingTask === task.id ? (
                                <div className="flex-1 flex items-center space-x-2">
                                  <Textarea
                                    value={editTaskText}
                                    onChange={(e) => setEditTaskText(e.target.value)}
                                    className="flex-1 min-h-[60px] text-sm"
                                  />
                                  <Button size="sm" onClick={() => saveEdit(email.id, task.id)}>
                                    <Check className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center space-x-2 flex-1">
                                    {task.confirmed && <CheckCircle className="h-4 w-4 text-green-600" />}
                                    <span className={`text-sm ${task.confirmed ? 'text-green-700' : 'text-gray-700'}`}>
                                      {task.text}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    {!task.confirmed && (
                                      <>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => editTask(email.id, task.id)}
                                        >
                                          <Edit2 className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => removeTask(email.id, task.id)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => confirmTask(email.id, task.id)}
                                        >
                                          <Check className="h-3 w-3" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                          
                          <div className="flex items-center space-x-2 mt-3">
                            <Textarea
                              placeholder="Add new task..."
                              value={newTask}
                              onChange={(e) => setNewTask(e.target.value)}
                              className="flex-1 min-h-[60px] text-sm"
                            />
                            <Button size="sm" onClick={() => addTask(email.id)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center mt-6">
              <Button onClick={handleLogIssues} className="bg-blue-600 hover:bg-blue-700">
                Log Issues
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Success Message Dialog */}
      <Dialog open={showSuccessMessage} onOpenChange={setShowSuccessMessage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Issues Logged Successfully</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              These issues will now appear in your <strong>Buildings task list</strong>.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailProcessing;
