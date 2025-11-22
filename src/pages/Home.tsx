import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, SortAsc, ShoppingCart, GraduationCap } from 'lucide-react';
import FileCard from '@/components/FileCard';
import PremiumCourseCard from '@/components/PremiumCourseCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/contexts/AuthContext';

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

const categories = ['All', 'Notes', 'Question Papers', 'Assignments', 'Study Material', 'Projects'];
const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'downloads', label: 'Most Downloaded' },
  { value: 'rating', label: 'Highest Rated' },
];

const premiumCourses = [
  {
    id: 1,
    title: 'HTML',
    description: 'HTML is the standard markup language used to create web pages...',
    image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
    price: '₹99',
    bgColor: 'bg-orange-500'
  },
  {
    id: 2,
    title: 'CSS',
    description: 'CSS is a cornerstone technology used for describing the presentation...',
    image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
    price: '₹99',
    bgColor: 'bg-blue-500'
  },
  {
    id: 3,
    title: 'C',
    description: 'The C programming language, developed in the early 1970s by Dennis Ritchie...',
    image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg',
    price: '₹149',
    bgColor: 'bg-indigo-600'
  },
  {
    id: 4,
    title: 'C++',
    description: 'C++ is a versatile and powerful programming language that combines the efficiency...',
    image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
    price: '₹149',
    bgColor: 'bg-pink-600'
  },
  {
    id: 5,
    title: 'JavaScript',
    description: 'JavaScript is a versatile programming language that enables interactive web experiences...',
    image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
    price: '₹199',
    bgColor: 'bg-yellow-500'
  },
  {
    id: 6,
    title: 'Java',
    description: 'Java is a versatile and powerful programming language that has been a cornerstone...',
    image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
    price: '₹199',
    bgColor: 'bg-red-500'
  },
  {
    id: 7,
    title: 'Python',
    description: 'Python is a high-level programming language known for its simplicity and readability...',
    image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    price: '₹249',
    bgColor: 'bg-blue-600'
  },
  {
    id: 8,
    title: 'PHP',
    description: 'PHP is a popular server-side scripting language designed for web development...',
    image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg',
    price: '₹149',
    bgColor: 'bg-purple-600'
  }
];

const Home = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileWithProfile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<typeof premiumCourses[0] | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    filterAndSortFiles();
  }, [files, searchQuery, selectedCategory, sortBy]);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortFiles = () => {
    let result = [...files];

    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        (file) =>
          file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          file.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter((file) => file.category === selectedCategory);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'downloads':
          return b.download_count - a.download_count;
        case 'rating':
          return (b.total_rating || 0) - (a.total_rating || 0);
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredFiles(result);
  };

  const handleBuyCourse = (course: typeof premiumCourses[0]) => {
    setSelectedCourse(course);
    setQrDialogOpen(true);
  };

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl glass-card card-shadow p-8 md:p-12 animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-50" />
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Discover & Share Knowledge
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Access thousands of study materials, notes, and resources shared by students like you
          </p>
          <div className="flex gap-4 flex-wrap">
            <Button className="gradient-primary smooth-transition hover:shadow-lg hover:scale-105">
              Browse Resources
            </Button>
            <Button variant="outline" className="smooth-transition hover:bg-secondary">
              Upload Your Files
            </Button>
          </div>
        </div>
      </div>

      {/* Premium Courses Section */}
      {user && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <GraduationCap className="h-8 w-8 text-primary" />
                Premium Courses
              </h2>
              <p className="text-muted-foreground mt-2">
                Master programming languages with our comprehensive courses
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {premiumCourses.map((course, index) => (
              <div
                key={course.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <PremiumCourseCard
                  title={course.title}
                  description={course.description}
                  image={course.image}
                  price={course.price}
                  bgColor={course.bgColor}
                  onBuyClick={() => handleBuyCourse(course)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Code Payment Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedCourse ? `Buy ${selectedCourse.title} Course` : 'Buy Premium Course'}
            </DialogTitle>
            <DialogDescription>
              Scan the QR code below to complete your payment
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG 
                value={`upi://pay?pa=example@upi&pn=College%20Resource%20Hub&am=${selectedCourse?.price.replace('₹', '')}&cu=INR&tn=${selectedCourse?.title}%20Course`}
                size={200}
                level="H"
              />
            </div>
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold text-primary">
                {selectedCourse?.price}
              </p>
              <p className="text-sm text-muted-foreground">
                Scan with any UPI app to pay
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Search and Filters */}
      <div className="glass-card card-shadow p-6 space-y-4 animate-fade-in-up">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 smooth-transition focus:glow-effect"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48 smooth-transition">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48 smooth-transition">
              <SortAsc className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Files Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {selectedCategory === 'All' ? 'All Resources' : selectedCategory}
          <span className="text-muted-foreground text-lg ml-2">
            ({filteredFiles.length})
          </span>
        </h2>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card card-shadow p-6 space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : filteredFiles.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredFiles.map((file, index) => (
              <div
                key={file.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <FileCard file={file} />
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card card-shadow p-12 text-center">
            <p className="text-muted-foreground text-lg">No resources found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
