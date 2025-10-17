import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye } from 'lucide-react';

interface StreamCardProps {
  thumbnail: string;
  title: string;
  streamer: string;
  viewers: number;
  category: string;
  isLive?: boolean;
  avatar?: string;
}

export const StreamCard = ({ 
  thumbnail, 
  title, 
  streamer, 
  viewers, 
  category, 
  isLive = true,
  avatar 
}: StreamCardProps) => {
  return (
    <Card className="group overflow-hidden border-border/50 bg-card/50 hover:bg-card/80 transition-all hover:shadow-lg hover:shadow-primary/10 cursor-pointer">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={thumbnail} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {isLive && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground border-0 glow-primary">
            LIVE
          </Badge>
        )}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded text-xs">
          <Eye className="h-3 w-3" />
          <span>{viewers.toLocaleString()}</span>
        </div>
      </div>
      
      <CardContent className="p-3">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src={avatar} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {streamer[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground">{streamer}</p>
            <p className="text-xs text-muted-foreground">{category}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
