import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

interface PremiumCourseCardProps {
  title: string;
  description: string;
  image: string;
  price: string;
  bgColor: string;
  onBuyClick: () => void;
}

const PremiumCourseCard = ({ title, description, image, price, bgColor, onBuyClick }: PremiumCourseCardProps) => {
  return (
    <Card className="glass-card card-shadow overflow-hidden group hover:scale-105 smooth-transition">
      <div className={`relative h-48 ${bgColor} flex items-center justify-center p-6`}>
        <img 
          src={image} 
          alt={title}
          className="h-full w-auto object-contain"
        />
        <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm p-2 rounded-full">
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">CC</span>
          </div>
          <span>By CourseCapsule</span>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-lg font-bold">
            {price}
          </Badge>
          <Button 
            onClick={onBuyClick}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Buy Now
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PremiumCourseCard;
