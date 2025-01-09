import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import {
  Phone,
  Calendar,
  Clock,
  Users,
  Ticket,
  CarFront,
  Hash,
  MapPin
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface SelfBookingForm {
  mobno: number;
  packageid: number;
  travel_mode: string;
  car_number_plate?: string;
}

interface GuestBookingForm extends SelfBookingForm {
  guest_name: string;
  guest_mobno: string;
}

function App() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const query_mobno = query.get('mobno');

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const {
    isPending,
    error,
    data: bookingData,
    isFetching
  } = useQuery({
    queryKey: ['bookingData', { mobno: query_mobno }],
    queryFn: async () => {
      const response = await fetch(
        `https://anandmohatsav-backend.onrender.com/api/booking/view?mobno=${query_mobno}`
      );
      return await response.json();
    }
  });

  if (!query_mobno) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold">
            Please provide your mobile number
          </h1>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (query_mobno) {
      const mobnoValue = Number(query_mobno);
      if (!isNaN(mobnoValue)) {
        selfForm.setValue('mobno', mobnoValue);
        guestForm.setValue('mobno', mobnoValue);
      }
    }
  }, [query_mobno]);

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const selfForm = useForm<SelfBookingForm>();
  const guestForm = useForm<GuestBookingForm>();

  const eventDate = new Date('2025-02-14T18:00:00');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeLeft = eventDate.getTime() - now.getTime();

      if (timeLeft > 0) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        setCountdown({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const onSelfSubmit = async (data: SelfBookingForm) => {
    try {
      if (!data.mobno || !data.packageid || !data.travel_mode) {
        toast({
          variant: 'destructive',
          title: 'Please fill all the required fields'
        });
        return;
      }

      if (data.travel_mode === 'self car' && !data.car_number_plate) {
        toast({
          variant: 'destructive',
          title: 'Please fill all the required fields'
        });
        return;
      }

      const response: any = await fetch(
        'https://anandmohatsav-backend.onrender.com/api/booking/self',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            mobno: data.mobno,
            packageid: data.packageid,
            travel_mode: data.travel_mode,
            car_number_plate: data.car_number_plate
          })
        }
      );

      if (response.status == 200) {
        toast({
          title: 'Booking Successful'
        });
      } else if (response.status == 400) {
        toast({
          variant: 'destructive',
          title: 'Already booked'
        });
        return;
      } else {
        toast({
          variant: 'destructive',
          title: 'An Error Occurred'
        });
        return;
      }
      queryClient.invalidateQueries(['bookingData']);
      setIsModalOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An Error Occurred'
      });
      console.error('Self submission error:', error);
    }
  };

  const onGuestSubmit = async (data: GuestBookingForm) => {
    try {
      if (
        !data.mobno ||
        !data.guest_name ||
        !data.guest_mobno ||
        !data.packageid ||
        !data.travel_mode
      ) {
        toast({
          variant: 'destructive',
          title: 'Please fill all the required fields'
        });
        return;
      }

      if (data.travel_mode === 'self car' && !data.car_number_plate) {
        toast({
          variant: 'destructive',
          title: 'Please fill all the required fields'
        });
        return;
      }

      const response: any = await fetch(
        'https://anandmohatsav-backend.onrender.com/api/booking/guest',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }
      );

      if (response.status == 200) {
        toast({
          title: 'Booking Successful'
        });
      } else if (response.status == 400) {
        toast({
          variant: 'destructive',
          title: 'Already booked'
        });
        return;
      } else {
        toast({
          variant: 'destructive',
          title: 'An Error Occurred'
        });
        return;
      }
      queryClient.invalidateQueries(['bookingData']);
      setIsModalOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An Error Occurred'
      });
      console.error('Guest submission error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          {/* <div className="inline-block">
            <PartyPopper className="w-16 h-16 text-primary mb-4 mx-auto animate-bounce" />
          </div> */}
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
            Anand Mohotsav
          </h1>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join us for an unforgettable celebration of joy, culture, and
            community spirit.
          </p>

          {/* Countdown Timer */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {Object.entries(countdown).map(([unit, value]) => (
              <Card key={unit} className="bg-card/50 backdrop-blur">
                <CardContent className="p-6">
                  <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
                    {value}
                  </span>
                  <span className="block text-sm text-muted-foreground uppercase tracking-wider mt-2">
                    {unit}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Event Details */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="p-6 bg-card/50 backdrop-blur">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Calendar className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Date</h3>
                  <p className="text-muted-foreground">
                    February 15, 2025 - February 17, 2025
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Clock className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Time</h3>
                  <p className="text-muted-foreground">
                    Check-in before breakfast
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Venue</h3>
                  <p className="text-muted-foreground">Research centre</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur">
            <div className="h-full flex flex-col justify-between">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Ready to Join?</h2>
                <p className="text-muted-foreground">
                  Secure your spot for this extraordinary event.
                </p>
              </div>
              <Button
                size="lg"
                className="w-full text-lg font-semibold"
                onClick={() => setIsModalOpen(true)}
              >
                Book Your Spot Now
              </Button>
            </div>
          </Card>
        </div>

        {/* Registered Users Table */}
        {bookingData?.data?.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Registered Mumukshus</h2>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Travel Mode</TableHead>
                    <TableHead>Booking Status</TableHead>
                    <TableHead>Transaction Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookingData.data.map((booking) => (
                    <TableRow key={booking.bookingid}>
                      <TableCell className="font-medium">
                        {booking.guest_name}
                      </TableCell>
                      <TableCell>{booking.mobno}</TableCell>
                      <TableCell>{booking.package}</TableCell>
                      <TableCell className="capitalize">
                        {booking.travel_mode.replace('_', ' ')}
                      </TableCell>
                      <TableCell>{booking.booking_status}</TableCell>
                      <TableCell>{booking.transaction_status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Booking Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Book Your Spot</h2>
              <Tabs defaultValue="self" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="self">Book for Self</TabsTrigger>
                  <TabsTrigger value="guest">Book for Guest</TabsTrigger>
                </TabsList>

                <TabsContent value="self">
                  <form
                    onSubmit={selfForm.handleSubmit(onSelfSubmit)}
                    className="space-y-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="text-muted-foreground" />
                        <Input
                          placeholder="Your mobile number"
                          type="number"
                          disabled={true}
                          {...selfForm.register('mobno', { required: true })}
                        />
                      </div>
                      {selfForm.formState.errors.mobno && (
                        <span className="text-destructive text-sm">
                          mobile number is required
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Ticket className="text-muted-foreground" />
                        <Select
                          onValueChange={(value) =>
                            selfForm.setValue('packageid', Number(value))
                          }
                          defaultValue={selfForm.watch('packageid')?.toString()}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Package" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              { id: 1, name: 'All days' },
                              { id: 2, name: 'Last day' }
                            ].map((option) => (
                              <SelectItem
                                key={option.id}
                                value={option.id.toString()}
                              >
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {selfForm.formState.errors.packageid && (
                        <span className="text-destructive text-sm">
                          select a package
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CarFront className="text-muted-foreground" />
                        <Select
                          onValueChange={(value) =>
                            selfForm.setValue('travel_mode', value)
                          }
                          defaultValue={selfForm.watch('travel_mode')}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Travel Mode" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              { key: 'self car', value: 'Own Car' },
                              { key: 'raj pravas', value: 'Raj Pravas' },
                              { key: 'other', value: 'Other' }
                            ].map((option) => (
                              <SelectItem key={option.key} value={option.key}>
                                {option.value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {selfForm.formState.errors.packageid && (
                        <span className="text-destructive text-sm">
                          Select a travel mode
                        </span>
                      )}
                    </div>

                    {selfForm.watch('travel_mode') === 'self car' && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="text-muted-foreground" />
                          <Input
                            placeholder="Your Car Number Plate"
                            {...selfForm.register('car_number_plate', {
                              required: true
                            })}
                          />
                        </div>
                        {selfForm.formState.errors.car_number_plate && (
                          <span className="text-destructive text-sm">
                            number plate is required
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        Book Event
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="guest">
                  <form
                    onSubmit={guestForm.handleSubmit(onGuestSubmit)}
                    className="space-y-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="text-muted-foreground" />
                        <Input
                          placeholder="Your mobile number"
                          type="number"
                          disabled={true}
                          {...guestForm.register('mobno', { required: true })}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="text-muted-foreground" />
                        <Input
                          placeholder="Guest Name"
                          {...guestForm.register('guest_name', {
                            required: true
                          })}
                        />
                      </div>
                      {guestForm.formState.errors.guest_name && (
                        <span className="text-destructive text-sm">
                          Guest name is required
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="text-muted-foreground" />
                        <Input
                          placeholder="Guest mobile number"
                          type="number"
                          {...guestForm.register('guest_mobno', {
                            required: true
                          })}
                        />
                      </div>
                      {guestForm.formState.errors.guest_mobno && (
                        <span className="text-destructive text-sm">
                          mobile number is required
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Ticket className="text-muted-foreground" />
                        <Select
                          onValueChange={(value) =>
                            guestForm.setValue('packageid', Number(value))
                          }
                          defaultValue={guestForm
                            .watch('packageid')
                            ?.toString()}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Package" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              { id: 1, name: 'All days' },
                              { id: 2, name: 'Last day' }
                            ].map((option) => (
                              <SelectItem
                                key={option.id}
                                value={option.id.toString()}
                              >
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {guestForm.formState.errors.packageid && (
                        <span className="text-destructive text-sm">
                          select a package
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CarFront className="text-muted-foreground" />
                        <Select
                          onValueChange={(value) =>
                            guestForm.setValue('travel_mode', value)
                          }
                          defaultValue={guestForm.watch('travel_mode')}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Travel Mode" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              { key: 'self car', value: 'Own Car' },
                              { key: 'raj pravas', value: 'Raj Pravas' },
                              { key: 'other', value: 'Other' }
                            ].map((option) => (
                              <SelectItem key={option.key} value={option.key}>
                                {option.value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {guestForm.formState.errors.packageid && (
                        <span className="text-destructive text-sm">
                          Select a travel mode
                        </span>
                      )}
                    </div>

                    {guestForm.watch('travel_mode') === 'self car' && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="text-muted-foreground" />
                          <Input
                            placeholder="Your Car Number Plate"
                            {...guestForm.register('car_number_plate', {
                              required: true
                            })}
                          />
                        </div>
                        {guestForm.formState.errors.car_number_plate && (
                          <span className="text-destructive text-sm">
                            number plate is required
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        Book Event
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
