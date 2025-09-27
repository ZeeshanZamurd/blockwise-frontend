import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react';

interface SubTask {
  id: string;
  title: string;
  status: 'open' | 'in progress' | 'complete';
  createdAt: string;
}

const SubTasks: React.FC = () => {
  const [subTasks, setSubTasks] = useState<SubTask[]>([
    { id: '1', title: 'Contact building manager', status: 'complete', createdAt: '2024-01-15' },
    { id: '2', title: 'Schedule repair assessment', status: 'in progress', createdAt: '2024-01-16' },
    { id: '3', title: 'Get contractor quotes', status: 'open', createdAt: '2024-01-17' }
  ]);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'open': return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-yellow-100 text-yellow-800';
      case 'open': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const addSubTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: SubTask = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        status: 'open',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setSubTasks([...subTasks, newTask]);
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  const updateTaskStatus = (taskId: string, newStatus: 'open' | 'in progress' | 'complete') => {
    setSubTasks(subTasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setSubTasks(subTasks.filter(task => task.id !== taskId));
  };

  const completedCount = subTasks.filter(task => task.status === 'complete').length;
  const totalCount = subTasks.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-lg">Tasks</CardTitle>
            <Badge variant="outline" className="text-xs">
              {completedCount}/{totalCount} completed
            </Badge>
          </div>
          <Button 
            onClick={() => setIsAddingTask(true)} 
            variant="outline" 
            size="sm"
            className="flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isAddingTask && (
            <div className="flex items-center space-x-2 p-3 border border-dashed border-gray-300 rounded-lg">
              <Input
                placeholder="Enter task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSubTask()}
                className="flex-1"
                autoFocus
              />
              <Button onClick={addSubTask} size="sm">Add</Button>
              <Button 
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskTitle('');
                }} 
                variant="ghost" 
                size="sm"
              >
                Cancel
              </Button>
            </div>
          )}
          
          {subTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3 flex-1">
                {getStatusIcon(task.status)}
                <span className={`${task.status === 'complete' ? 'line-through text-gray-500' : ''}`}>
                  {task.title}
                </span>
                <Badge className={getStatusColor(task.status)} variant="outline">
                  {task.status}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <Select value={task.status} onValueChange={(value: 'open' | 'in progress' | 'complete') => updateTaskStatus(task.id, value)}>
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={() => deleteTask(task.id)} 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {subTasks.length === 0 && !isAddingTask && (
            <div className="text-center py-2 text-gray-500">
              <p className="text-sm">No tasks yet. Click "Add Task" to get started.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubTasks;