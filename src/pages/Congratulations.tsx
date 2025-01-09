import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { PartyPopper, Calendar, MapPin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Confetti = () => (
  <div className="fixed inset-0 pointer-events-none">
    <div className="absolute left-1/4 animate-confetti-l">
      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
    </div>
    <div className="absolute left-1/3 animate-confetti-m">
      <div className="w-2 h-2 bg-blue-500 rounded-full" />
    </div>
    <div className="absolute left-1/2 animate-confetti-s">
      <div className="w-2 h-2 bg-red-500 rounded-full" />
    </div>
    <div className="absolute right-1/4 animate-confetti-l">
      <div className="w-2 h-2 bg-green-500 rounded-full" />
    </div>
    <div className="absolute right-1/3 animate-confetti-m">
      <div className="w-2 h-2 bg-purple-500 rounded-full" />
    </div>
    <div className="absolute right-1/2 animate-confetti-s">
      <div className="w-2 h-2 bg-pink-500 rounded-full" />
    </div>
  </div>
);

const Sparkles = () => {
  return Array.from({ length: 12 }).map((_, i) => (
    <div
      key={i}
      className={`absolute w-1 h-1 bg-primary rounded-full animate-sparkle`}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`
      }}
    />
  ));
};

export default function Congratulations() {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  const query_mobno = localStorage.getItem('mobno');

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background p-4 md:p-8 overflow-hidden">
      {showConfetti && <Confetti />}
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 relative">
          {/* Sparkles effect */}
          <div className="absolute inset-0 -z-10">
            <Sparkles />
          </div>

          {/* Success Icon with animated ring */}
          <div className="relative inline-block mb-8">
            <PartyPopper className="w-16 h-16 text-primary animate-tada" />
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-8 bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text animate-fade-in">
            Congratulations!
          </h1>

          <Card className="p-8 bg-card/50 backdrop-blur max-w-2xl mx-auto mb-8 border-primary/20 animate-float">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-primary/10 rounded-full p-2 bg-green-100">
                <Check className="w-8 h-8" color="green" />
              </div>
            </div>
            <p className="text-xl text-muted-foreground mb-6">
              Your registration has been successfully completed. We look forward
              to seeing you at the event!
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-left mt-8">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Event Date</p>
                  <p className="text-sm text-muted-foreground">
                    February 15, 2025
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">
                    Research Centre
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="px-8 animate-fade-in"
              style={{ animationDelay: '0.7s' }}
              onClick={() => navigate(`/?mobno=${query_mobno}`)}
            >
              Back To Home
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tada {
          0% { transform: scale(1); }
          10%, 20% { transform: scale(0.9) rotate(-3deg); }
          30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }
          40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }
          100% { transform: scale(1) rotate(0); }
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }

        @keyframes float {
          0% { transform: translateY(10px); }
          100% { transform: translateY(0); }
        }

        @keyframes confetti-l {
          0% { transform: translateY(-100%) rotate(0deg); }
          100% { transform: translateY(100vh) rotate(360deg); }
        }

        @keyframes confetti-m {
          0% { transform: translateY(-100%) rotate(0deg); }
          100% { transform: translateY(100vh) rotate(-360deg); }
        }

        @keyframes confetti-s {
          0% { transform: translateY(-100%) rotate(0deg); }
          100% { transform: translateY(100vh) rotate(720deg); }
        }

        .animate-tada {
          animation: tada 1s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }

        .animate-float {
          animation: float 1s ease-out;
        }

        .animate-confetti-l {
          animation: confetti-l 3s linear infinite;
        }

        .animate-confetti-m {
          animation: confetti-m 2.5s linear infinite;
        }

        .animate-confetti-s {
          animation: confetti-s 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
