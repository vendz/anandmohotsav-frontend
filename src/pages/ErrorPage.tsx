import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { XCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Ripples = () => {
  return Array.from({ length: 6 }).map((_, i) => (
    <div
      key={i}
      className="absolute rounded-full border border-destructive/20 animate-ripple"
      style={{
        width: `${(i + 1) * 100}px`,
        height: `${(i + 1) * 100}px`,
        animationDelay: `${i * 0.2}s`
      }}
    />
  ));
};

export default function ErrorPage() {
  const navigate = useNavigate();
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setShowAnimation(true);
    const timer = setTimeout(() => setShowAnimation(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-destructive/5 via-background to-background p-4 md:p-8 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 relative">
          {/* Ripple effect */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            {showAnimation && <Ripples />}
          </div>

          {/* Error Icon with animated pulse */}
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-destructive/20 rounded-full animate-ping" />
            <div className="relative bg-destructive/10 rounded-full p-4">
              <XCircle className="w-16 h-16 text-destructive animate-shake" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-8 bg-gradient-to-r from-destructive to-destructive/60 text-transparent bg-clip-text animate-fade-in">
            Oops!
          </h1>

          <Card className="p-8 bg-card/50 backdrop-blur max-w-2xl mx-auto mb-8 border-destructive/20 animate-float">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-destructive/10 rounded-full p-2">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <p className="text-xl text-muted-foreground mb-6">
              Something went wrong with your registration. Please try again or
              contact support if the problem persists.
            </p>
            <div className="text-sm text-muted-foreground p-4 bg-destructive/5 rounded-lg">
              <p>Support Email:</p>
              <p>support@vitraagvigyaan.org</p>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              className="px-8 animate-fade-in inline-flex items-center gap-2"
              style={{ animationDelay: '0.7s' }}
              onClick={() => navigate('/?mobno=9876543210')} //TODO: fix navigation
            >
              <ArrowLeft className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }

        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }

        @keyframes float {
          0% { transform: translateY(10px); }
          100% { transform: translateY(0); }
        }

        .animate-shake {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }

        .animate-ripple {
          animation: ripple 3s linear infinite;
          transform-origin: center;
        }

        .animate-float {
          animation: float 1s ease-out;
        }
      `}</style>
    </div>
  );
}
