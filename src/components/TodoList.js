"use client"
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, Circle, Lock, Pencil, Trash2, Plus, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export const TodoListWithPrerequisites = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Créer le plan du projet",
      completed: false,
      prerequisites: []
    },
    {
      id: 2,
      title: "Définir les objectifs",
      completed: false,
      prerequisites: [1]
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const canCompleteTask = (task) => {
    return task.prerequisites.every(preId =>
      tasks.find(t => t.id === preId)?.completed
    );
  };

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId && canCompleteTask(task)) {
        return { ...task, completed: !task.completed };
      }
      if (task.prerequisites.includes(taskId) && task.completed) {
        return { ...task, completed: false };
      }
      return task;
    }));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const TaskDialog = ({ task, isNew, onClose }) => {
    const [title, setTitle] = useState(isNew ? '' : task?.title || '');
    const [prerequisites, setPrerequisites] = useState(isNew ? [] : task?.prerequisites || []);

    const availableTasks = tasks.filter(t => t.id !== (task?.id || -1));

    const handleSave = () => {
      if (isNew) {
        const newId = Math.max(0, ...tasks.map(t => t.id)) + 1;
        setTasks([...tasks, { id: newId, title, completed: false, prerequisites }]);
      } else {
        setTasks(tasks.map(t => (t.id === task.id ? { ...t, title, prerequisites } : t)));
      }
      onClose();
    };

    return (
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-gray-100">
            {isNew ? 'Ajouter une nouvelle tâche' : 'Modifier la tâche'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-4">
          <div>
            <label className="text-sm font-medium mb-2 block text-gray-300">
              Titre de la tâche
            </label>
            <Input
              className="bg-gray-800 border-gray-700 text-gray-100 focus:border-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entrer le titre de la tâche"
            />
          </div>

          {availableTasks.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-300">
                Prérequis
              </label>
              <div className="space-y-2">
                {availableTasks.map(t => (
                  <div key={t.id} className="flex items-center space-x-2">
                    <Checkbox
                      className="border-gray-600"
                      checked={prerequisites.includes(t.id)}
                      onCheckedChange={(checked) => {
                        setPrerequisites(checked ? [...prerequisites, t.id] : prerequisites.filter(id => id !== t.id));
                      }}
                    />
                    <span className="text-gray-300">{t.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSave}
            >
              {isNew ? 'Ajouter' : 'Mettre à jour'}
            </Button>
          </div>
        </div>
      </DialogContent>
    );
  };

  // Calcul des statistiques pour le graphique
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const pieData = [
    { name: 'Complétées', value: completedTasks, color: '#4ade80' },
    { name: 'À faire', value: totalTasks - completedTasks, color: '#6b7280' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique et statistiques */}
        <Card className="lg:col-span-1 bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-100 mb-4">Progression</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    labelLine={false}
                    label={null}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                    itemStyle={{ color: '#f3f4f6' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span style={{ color: '#f3f4f6' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-gray-300">
                Tâches complétées : {completedTasks} sur {totalTasks}
              </p>
              <p className="text-gray-300">
                Progression : {totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Liste des tâches */}
        <Card className="lg:col-span-2 bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <Calendar className="w-8 h-8 text-blue-400" />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Task Manager
                </h2>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      setEditingTask(null);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </DialogTrigger>
                <TaskDialog task={editingTask} isNew={!editingTask} onClose={() => setIsDialogOpen(false)} />
              </Dialog>
            </div>

            <div className="space-y-3">
              {tasks.map(task => {
                const isLocked = !canCompleteTask(task);
                return (
                  <div
                    key={task.id}
                    className={`flex items-center p-4 rounded-xl border transition-all duration-200
                      ${isLocked ? 'bg-gray-800/50 border-gray-700' : 'hover:bg-gray-700/50 border-gray-700'}
                      ${task.completed ? 'border-green-600/30 bg-green-900/20' : ''}
                      backdrop-blur-sm
                    `}
                  >
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => !isLocked && toggleTask(task.id)}
                    >
                      <div className={`font-medium ${task.completed ? 'text-green-400' : 'text-gray-200'}`}>
                        {task.title}
                      </div>
                      {task.prerequisites.length > 0 && (
                        <div className="text-sm text-gray-400">
                          Prérequis: Tâches {task.prerequisites.join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-gray-700/50 text-gray-400 hover:text-gray-200"
                        onClick={() => {
                          setEditingTask(task);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-gray-700/50 text-gray-400 hover:text-gray-200"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {isLocked ? (
                        <Lock className="w-6 h-6 text-gray-500" />
                      ) : task.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TodoListWithPrerequisites;