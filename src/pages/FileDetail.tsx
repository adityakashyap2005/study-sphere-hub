import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Download, Star, Calendar, User, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface FileData {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  download_count: number;
  total_rating: number;
  rating_count: number;
  created_at: string;
  uploader_id: string;
  profiles: {
    full_name: string | null;
    email: string;
  };
}

const FileDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<FileData | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchFileDetails();
      fetchUserRating();
    }
  }, [id]);

  const fetchFileDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*, profiles(full_name, email)')
        .eq('id', id)
        .single();

      if (error) throw error;
      setFile(data);
    } catch (error) {
      console.error('Error fetching file:', error);
      toast.error('Failed to load file details');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRating = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('ratings')
        .select('rating')
        .eq('file_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setUserRating(data.rating);
      }
    } catch (error) {
      console.error('Error fetching rating:', error);
    }
  };

  const handleRating = async (rating: number) => {
    if (!user) {
      toast.error('Please sign in to rate');
      return;
    }

    try {
      const { error } = await supabase
        .from('ratings')
        .upsert({
          file_id: id,
          user_id: user.id,
          rating,
        });

      if (error) throw error;

      setUserRating(rating);
      toast.success('Rating submitted!');
      fetchFileDetails();
    } catch (error) {
      console.error('Error rating file:', error);
      toast.error('Failed to submit rating');
    }
  };

  const handleDownload = async () => {
    if (!file) return;

    setDownloading(true);

    try {
      // Get download URL
      const { data } = supabase.storage
        .from('resource-files')
        .getPublicUrl(file.file_path);

      // Increment download count
      await supabase.rpc('increment_download_count', { file_uuid: file.id });

      // Trigger download
      window.open(data.publicUrl, '_blank');
      toast.success('Download started!');
      
      // Refresh file details to show updated count
      fetchFileDetails();
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">File not found</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8 animate-fade-in">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="smooth-transition hover:bg-secondary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card className="glass-card card-shadow">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary/20 text-primary border-primary/50">
                  {file.category}
                </Badge>
              </div>
              <CardTitle className="text-3xl mb-2">{file.title}</CardTitle>
              <CardDescription className="text-base">
                {file.description || 'No description provided'}
              </CardDescription>
            </div>
            <FileText className="h-12 w-12 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card p-4 text-center">
              <Download className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{file.download_count}</p>
              <p className="text-xs text-muted-foreground">Downloads</p>
            </div>
            <div className="glass-card p-4 text-center">
              <Star className="h-5 w-5 mx-auto mb-2 text-success fill-success" />
              <p className="text-2xl font-bold">
                {file.total_rating > 0 ? file.total_rating.toFixed(1) : '—'}
              </p>
              <p className="text-xs text-muted-foreground">Rating ({file.rating_count})</p>
            </div>
            <div className="glass-card p-4 text-center">
              <Calendar className="h-5 w-5 mx-auto mb-2 text-accent" />
              <p className="text-sm font-bold">
                {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
              </p>
              <p className="text-xs text-muted-foreground">Uploaded</p>
            </div>
          </div>

          {/* Uploader Info */}
          <div className="flex items-center gap-3 glass-card p-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                {file.profiles.full_name?.[0] || file.profiles.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{file.profiles.full_name || 'Anonymous'}</p>
              <p className="text-sm text-muted-foreground">{file.profiles.email}</p>
            </div>
          </div>

          {/* Rating */}
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">Rate this resource</h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className="smooth-transition hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= userRating
                        ? 'text-success fill-success'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            {userRating > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                You rated this {userRating} star{userRating !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Download Button */}
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full gradient-primary smooth-transition hover:shadow-lg hover:scale-105"
            size="lg"
          >
            {downloading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Download Resource
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileDetail;
