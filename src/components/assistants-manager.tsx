
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Trash2 } from 'lucide-react';

const addAssistantSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type Assistant = {
  id: number;
  email: string;
};

export function AssistantsManager({ adminId }: { adminId: number }) {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const form = useForm<z.infer<typeof addAssistantSchema>>({
    resolver: zodResolver(addAssistantSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        const res = await fetch(`/api/users/assistants?admin_id=${adminId}`);
        if (res.ok) {
          const data = await res.json();
          setAssistants(data);
        }
      } catch (error) {
        console.error('Error fetching assistants:', error);
      }
    };

    fetchAssistants();
  }, [adminId]);

  const handleAddAssistant = async (values: z.infer<typeof addAssistantSchema>) => {
    const success = await signUp(values.email, values.password);
    if (success) {
      toast({ title: 'Success', description: 'Assistant added successfully.' });
      form.reset();
      // Refresh the list of assistants
      const res = await fetch(`/api/users/assistants?admin_id=${adminId}`);
      if (res.ok) {
        const data = await res.json();
        setAssistants(data);
      }
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to add assistant.' });
    }
  };

  const handleDeleteAssistant = async (id: number) => {
    try {
      const res = await fetch(`/api/users/assistants/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAssistants(assistants.filter(a => a.id !== id));
        toast({ title: 'Success', description: 'Assistant deleted successfully.' });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete assistant.' });
      }
    } catch (error) {
      console.error('Error deleting assistant:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete assistant.' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Assistants</CardTitle>
        <CardDescription>Add or remove assistant accounts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Add Assistant</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddAssistant)} className="space-y-4 mt-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Add Assistant
              </Button>
            </form>
          </Form>
        </div>
        <div>
          <h3 className="text-lg font-medium">Existing Assistants</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assistants.map(assistant => (
                <TableRow key={assistant.id}>
                  <TableCell>{assistant.email}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteAssistant(assistant.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
