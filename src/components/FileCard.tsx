import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Star, Calendar, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FileCardProps {
  file: {
    id: string;
    title: string;
    description: string | null;
    category: string;
    download_count: number;
    total_rating: number;
    rating_count: number;
    created_at: string;
    profiles: {
      full_name: string | null;
      email: string;
    };
  };
  showEdit?: boolean;
}

const FileCard = ({ file, showEdit = false }: FileCardProps) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Notes': 'bg-primary/20 text-primary border-primary/50',
      'Question Papers': 'bg-accent/20 text-accent border-accent/50',
      'Assignments': 'bg-success/20 text-success border-success/50',
      'Study Material': 'bg-muted text-muted-foreground border-muted-foreground/50',
      'Projects': 'bg-destructive/20 text-destructive border-destructive/50',
    };
    return colors[category] || 'bg-muted text-muted-foreground';
  };

  return (
    <Card className="glass-card card-shadow smooth-transition hover:scale-105 hover:elevated-shadow group">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-1">{file.title}</CardTitle>
          <Badge className={`${getCategoryColor(file.category)} shrink-0`}>
            {file.category}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2 min-h-[40px]">
          {file.description || 'No description provided'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-success fill-success" />
            <span className="font-medium">
              {file.total_rating > 0 ? file.total_rating.toFixed(1) : '—'}
            </span>
            <span className="text-xs">({file.rating_count})</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>{file.download_count}</span>
          </div>
        </div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{file.profiles.full_name || file.profiles.email}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link to={`/file/${file.id}`} className="w-full">
          <Button className="w-full gradient-primary smooth-transition hover:shadow-lg">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default FileCard;
