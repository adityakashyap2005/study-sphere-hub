import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload as UploadIcon, Loader2, FileUp } from 'lucide-react';
import { toast } from 'sonner';

const categories = ['Notes', 'Question Papers', 'Assignments', 'Study Material', 'Projects'];

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !formData.category || !formData.title || !user) {
      toast.error('Please fill in all required fields');
      return;
    }

    setUploading(true);

    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('resource-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Insert file metadata into database
      const { error: insertError } = await supabase
        .from('files')
        .insert([{
          title: formData.title,
          description: formData.description,
          category: formData.category as any,
          file_path: fileName,
          file_size: file.size,
          file_type: file.type,
          uploader_id: user.id,
        }]);

      if (insertError) throw insertError;

      toast.success('File uploaded successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Upload Resource
        </h1>
        <p className="text-muted-foreground">Share your knowledge with the community</p>
      </div>

      <Card className="glass-card card-shadow">
        <CardHeader>
          <CardTitle>Resource Details</CardTitle>
          <CardDescription>Fill in the information about your resource</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Data Structures Lecture Notes"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="smooth-transition focus:glow-effect"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the resource..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="smooth-transition focus:glow-effect"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger className="smooth-transition focus:glow-effect">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">File *</Label>
              <div className="relative">
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  required
                  className="smooth-transition focus:glow-effect cursor-pointer"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
                />
                {file && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <FileUp className="h-4 w-4" />
                    <span>{file.name}</span>
                    <span className="text-xs">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT, ZIP (Max 50MB)
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={uploading}
              className="w-full gradient-primary smooth-transition hover:shadow-lg hover:scale-105"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Upload Resource
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Upload;
