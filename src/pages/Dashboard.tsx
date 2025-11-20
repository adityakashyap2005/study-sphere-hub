import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Upload as UploadIcon, Download, Star } from 'lucide-react';
import FileCard from '@/components/FileCard';

interface FileWithProfile {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_path: string;
  download_count: number;
  total_rating: number;
  rating_count: number;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string;
  };
}

const Dashboard = () => {
  const { user } = useAuth();
  const [trendingFiles, setTrendingFiles] = useState<FileWithProfile[]>([]);
  const [userFiles, setUserFiles] = useState<FileWithProfile[]>([]);
  const [stats, setStats] = useState({
    totalUploads: 0,
    totalDownloads: 0,
    avgRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch trending files
      const { data: trending } = await supabase
        .from('files')
        .select('*, profiles(full_name, email)')
        .order('total_rating', { ascending: false })
        .order('download_count', { ascending: false })
        .limit(6);

      // Fetch user's files
      const { data: myFiles } = await supabase
        .from('files')
        .select('*, profiles(full_name, email)')
        .eq('uploader_id', user?.id)
        .order('created_at', { ascending: false });

      // Calculate stats
      const totalUploads = myFiles?.length || 0;
      const totalDownloads = myFiles?.reduce((sum, file) => sum + file.download_count, 0) || 0;
      const avgRating = myFiles?.length
        ? myFiles.reduce((sum, file) => sum + (file.total_rating || 0), 0) / myFiles.length
        : 0;

      setTrendingFiles(trending || []);
      setUserFiles(myFiles || []);
      setStats({ totalUploads, totalDownloads, avgRating });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 md:pb-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground">Track your contributions and discover trending resources</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: 'Total Uploads',
            value: stats.totalUploads,
            icon: UploadIcon,
            color: 'text-primary',
          },
          {
            title: 'Total Downloads',
            value: stats.totalDownloads,
            icon: Download,
            color: 'text-accent',
          },
          {
            title: 'Average Rating',
            value: stats.avgRating.toFixed(1),
            icon: Star,
            color: 'text-success',
          },
        ].map((stat, index) => (
          <Card 
            key={stat.title} 
            className="glass-card card-shadow smooth-transition hover:scale-105 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="trending" className="space-y-4">
        <TabsList className="glass-card">
          <TabsTrigger value="trending">
            <TrendingUp className="mr-2 h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="myuploads">
            <UploadIcon className="mr-2 h-4 w-4" />
            My Uploads
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-4">
          <Card className="glass-card card-shadow">
            <CardHeader>
              <CardTitle>Trending Resources</CardTitle>
              <CardDescription>Most popular resources in the community</CardDescription>
            </CardHeader>
            <CardContent>
              {trendingFiles.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {trendingFiles.map((file) => (
                    <FileCard key={file.id} file={file} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No trending files yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="myuploads" className="space-y-4">
          <Card className="glass-card card-shadow">
            <CardHeader>
              <CardTitle>My Uploads</CardTitle>
              <CardDescription>Resources you've shared with the community</CardDescription>
            </CardHeader>
            <CardContent>
              {userFiles.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {userFiles.map((file) => (
                    <FileCard key={file.id} file={file} showEdit />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">You haven't uploaded any files yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
