
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Search, Save, Plus, Edit, Trash2 } from 'lucide-react';

interface Translation {
  id: string;
  key: string;
  english_text: string;
  bulgarian_text: string;
  category?: string;
  context?: string;
}

interface SimpleTextEditorProps {
  open: boolean;
  onClose: () => void;
}

const SimpleTextEditor: React.FC<SimpleTextEditorProps> = ({ open, onClose }) => {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [filteredTranslations, setFilteredTranslations] = useState<Translation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTranslation, setSelectedTranslation] = useState<Translation | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [newTranslation, setNewTranslation] = useState({
    key: '',
    english_text: '',
    bulgarian_text: '',
    category: '',
    context: ''
  });
  const [loading, setLoading] = useState(false);

  const loadTranslations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .order('key');
      
      if (error) throw error;
      
      setTranslations(data || []);
      setFilteredTranslations(data || []);
    } catch (error) {
      console.error('Error loading translations:', error);
      toast({
        title: "Error",
        description: "Failed to load translations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadTranslations();
    }
  }, [open]);

  useEffect(() => {
    const filtered = translations.filter(t => 
      t.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.english_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.bulgarian_text.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTranslations(filtered);
  }, [searchTerm, translations]);

  const handleSave = async () => {
    if (!selectedTranslation) return;
    
    try {
      const { error } = await supabase
        .from('translations')
        .update({
          english_text: selectedTranslation.english_text,
          bulgarian_text: selectedTranslation.bulgarian_text,
          category: selectedTranslation.category,
          context: selectedTranslation.context,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTranslation.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Translation updated successfully"
      });
      
      setEditMode(false);
      loadTranslations();
    } catch (error) {
      console.error('Error saving translation:', error);
      toast({
        title: "Error",
        description: "Failed to save translation",
        variant: "destructive"
      });
    }
  };

  const handleAddNew = async () => {
    if (!newTranslation.key || !newTranslation.english_text) {
      toast({
        title: "Error",
        description: "Key and English text are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('translations')
        .insert([newTranslation]);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "New translation added successfully"
      });
      
      setNewTranslation({
        key: '',
        english_text: '',
        bulgarian_text: '',
        category: '',
        context: ''
      });
      
      loadTranslations();
    } catch (error) {
      console.error('Error adding translation:', error);
      toast({
        title: "Error",
        description: "Failed to add translation",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this translation?')) return;
    
    try {
      const { error } = await supabase
        .from('translations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Translation deleted successfully"
      });
      
      setSelectedTranslation(null);
      loadTranslations();
    } catch (error) {
      console.error('Error deleting translation:', error);
      toast({
        title: "Error",
        description: "Failed to delete translation",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Simple Text Editor</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search translations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Translations List */}
            <Card className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">All Translations ({filteredTranslations.length})</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                {loading ? (
                  <div className="text-center py-4">Loading translations...</div>
                ) : (
                  <div className="space-y-2">
                    {filteredTranslations.map((translation) => (
                      <div
                        key={translation.id}
                        className={`p-3 border rounded cursor-pointer hover:bg-accent transition-colors ${
                          selectedTranslation?.id === translation.id ? 'bg-accent' : ''
                        }`}
                        onClick={() => {
                          setSelectedTranslation(translation);
                          setEditMode(false);
                        }}
                      >
                        <div className="font-medium text-sm">{translation.key}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          EN: {translation.english_text}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          BG: {translation.bulgarian_text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Editor Panel */}
            <Card className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {selectedTranslation ? 'Edit Translation' : 'Add New Translation'}
                  </CardTitle>
                  {selectedTranslation && (
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditMode(!editMode)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(selectedTranslation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto space-y-4">
                {selectedTranslation ? (
                  editMode ? (
                    <>
                      <div>
                        <Label>Key</Label>
                        <Input
                          value={selectedTranslation.key}
                          onChange={(e) => setSelectedTranslation({
                            ...selectedTranslation,
                            key: e.target.value
                          })}
                          disabled
                        />
                      </div>
                      <div>
                        <Label>English Text</Label>
                        <Textarea
                          value={selectedTranslation.english_text}
                          onChange={(e) => setSelectedTranslation({
                            ...selectedTranslation,
                            english_text: e.target.value
                          })}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Bulgarian Text</Label>
                        <Textarea
                          value={selectedTranslation.bulgarian_text}
                          onChange={(e) => setSelectedTranslation({
                            ...selectedTranslation,
                            bulgarian_text: e.target.value
                          })}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Input
                          value={selectedTranslation.category || ''}
                          onChange={(e) => setSelectedTranslation({
                            ...selectedTranslation,
                            category: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <Label>Context</Label>
                        <Input
                          value={selectedTranslation.context || ''}
                          onChange={(e) => setSelectedTranslation({
                            ...selectedTranslation,
                            context: e.target.value
                          })}
                        />
                      </div>
                      <Button onClick={handleSave} className="w-full">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <Label className="font-medium">Key:</Label>
                        <p className="text-sm bg-muted p-2 rounded">{selectedTranslation.key}</p>
                      </div>
                      <div>
                        <Label className="font-medium">English:</Label>
                        <p className="text-sm bg-muted p-2 rounded">{selectedTranslation.english_text}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Bulgarian:</Label>
                        <p className="text-sm bg-muted p-2 rounded">{selectedTranslation.bulgarian_text}</p>
                      </div>
                      {selectedTranslation.category && (
                        <div>
                          <Label className="font-medium">Category:</Label>
                          <p className="text-sm bg-muted p-2 rounded">{selectedTranslation.category}</p>
                        </div>
                      )}
                      {selectedTranslation.context && (
                        <div>
                          <Label className="font-medium">Context:</Label>
                          <p className="text-sm bg-muted p-2 rounded">{selectedTranslation.context}</p>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <>
                    <div>
                      <Label>Key *</Label>
                      <Input
                        value={newTranslation.key}
                        onChange={(e) => setNewTranslation({
                          ...newTranslation,
                          key: e.target.value
                        })}
                        placeholder="e.g., services.flat-tyre.title"
                      />
                    </div>
                    <div>
                      <Label>English Text *</Label>
                      <Textarea
                        value={newTranslation.english_text}
                        onChange={(e) => setNewTranslation({
                          ...newTranslation,
                          english_text: e.target.value
                        })}
                        rows={3}
                        placeholder="Enter English text"
                      />
                    </div>
                    <div>
                      <Label>Bulgarian Text</Label>
                      <Textarea
                        value={newTranslation.bulgarian_text}
                        onChange={(e) => setNewTranslation({
                          ...newTranslation,
                          bulgarian_text: e.target.value
                        })}
                        rows={3}
                        placeholder="Enter Bulgarian text"
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Input
                        value={newTranslation.category}
                        onChange={(e) => setNewTranslation({
                          ...newTranslation,
                          category: e.target.value
                        })}
                        placeholder="e.g., services"
                      />
                    </div>
                    <div>
                      <Label>Context</Label>
                      <Input
                        value={newTranslation.context}
                        onChange={(e) => setNewTranslation({
                          ...newTranslation,
                          context: e.target.value
                        })}
                        placeholder="Additional context"
                      />
                    </div>
                    <Button onClick={handleAddNew} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Translation
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleTextEditor;
