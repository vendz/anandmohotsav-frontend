import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { useRazorpay, RazorpayOrderOptions } from 'react-razorpay';

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

  const [isLoading, setIsLoading] = useState(false);
  const [mobileNumber, setMobileNumber] = useState<string>('');

  // const queryClient = useQueryClient();

  const { Razorpay } = useRazorpay();

  const handlePayment = async (packageid: Number) => {
    const orderResponse = await fetch(
      `https://anandmohatsav-backend.onrender.com/api/booking/order?packageid=${packageid}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const orderData = await orderResponse.json();

    const options: RazorpayOrderOptions = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.data.amount,
      currency: orderData.data.currency,
      name: 'Anand Mahotsav',
      description: 'Payment for Anand Mahotsav',
      image: 'https://vitraagvigyaan.org/img/logo.png',
      order_id: orderData.data.id,
      handler: (response) => {
        setIsLoading(false);
        console.log(response);
        alert('Payment Successful!');
      },
      prefill: {
        name: greetingData.issuedto,
        email: greetingData.email,
        contact: query_mobno || undefined
      },
      theme: {
        color: '#F37254'
      },
      modal: {
        ondismiss: () => {
          setIsLoading(false);
        }
      }
    };

    const razorpayInstance = new Razorpay(options);
    razorpayInstance.open();
  };

  const { data: bookingData } = useQuery({
    queryKey: ['bookingData', { mobno: query_mobno }],
    queryFn: async () => {
      const response = await fetch(
        `https://anandmohatsav-backend.onrender.com/api/booking/view?mobno=${query_mobno}`
      );
      return await response.json();
    }
  });

  const { data: greetingData } = useQuery({
    queryKey: ['greetingData', { mobno: query_mobno }],
    queryFn: async () => {
      const response = await fetch(
        `https://anandmohatsav-backend.onrender.com/api/booking/greetings?mobno=${query_mobno}`
      );
      return await response.json();
    }
  });

  if (!query_mobno) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Phone className="h-6 w-6" />
              <span>Enter Your Mobile Number</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="tel"
              placeholder="Enter your mobile number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="text-center"
            />
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={() => {
                if (
                  mobileNumber.length !== 10 ||
                  !mobileNumber ||
                  mobileNumber.charAt(0) == '+' ||
                  mobileNumber.charAt(0) == '0'
                ) {
                  toast({
                    variant: 'destructive',
                    title: 'Invalid Mobile Number',
                    description: 'Please enter a valid mobile number'
                  });
                  return;
                }
                window.location.href = '/?mobno=' + mobileNumber;
              }}
              className="w-full max-w-xs"
            >
              Submit
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    if (query_mobno) {
      localStorage.setItem('mobno', query_mobno);
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
      setIsLoading(true);
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

      handlePayment(data.packageid);

      // const response: any = await fetch(
      //   'https://anandmohatsav-backend.onrender.com/api/booking/self',
      //   {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json'
      //     },
      //     body: JSON.stringify({
      //       mobno: data.mobno,
      //       packageid: data.packageid,
      //       travel_mode: data.travel_mode,
      //       car_number_plate: data.car_number_plate
      //     })
      //   }
      // );

      // if (response.status == 200) {
      //   toast({
      //     title: 'Booking Successful'
      //   });
      // } else if (response.status == 400) {
      //   toast({
      //     variant: 'destructive',
      //     title: 'Already booked'
      //   });
      //   return;
      // } else {
      //   toast({
      //     variant: 'destructive',
      //     title: 'An Error Occurred'
      //   });
      //   return;
      // }
      // queryClient.invalidateQueries({ queryKey: ['bookingData'] });
      // setIsModalOpen(false);
    } catch (error) {
      setIsLoading(false);
      toast({
        variant: 'destructive',
        title: 'An Error Occurred'
      });
      console.error('Self submission error:', error);
    }
  };

  const onGuestSubmit = async (data: GuestBookingForm) => {
    try {
      setIsLoading(true);
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

      handlePayment(data.packageid);

      // const response: any = await fetch(
      //   'https://anandmohatsav-backend.onrender.com/api/booking/guest',
      //   {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json'
      //     },
      //     body: JSON.stringify(data)
      //   }
      // );

      // if (response.status == 200) {
      //   toast({
      //     title: 'Booking Successful'
      //   });
      // } else if (response.status == 400) {
      //   toast({
      //     variant: 'destructive',
      //     title: 'Already booked'
      //   });
      //   return;
      // } else {
      //   toast({
      //     variant: 'destructive',
      //     title: 'An Error Occurred'
      //   });
      //   return;
      // }
      // queryClient.invalidateQueries({ queryKey: ['bookingData'] });
      // setIsModalOpen(false);
    } catch (error) {
      setIsLoading(false);
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
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
            Anand Mahotsav
          </h1>
          {greetingData?.data && (
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              JSDV, {greetingData.data.issuedto}! Please join us for an
              unforgettable celebration of joy, culture, and community spirit.
            </p>
          )}

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
                  {bookingData.data.map((booking: any) => (
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

        {/* Policy Information */}
        <div className="mt-16 mb-8">
          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="about">
                  <AccordionTrigger>About Us</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      To learn more about us, please visit:{' '}
                      <a
                        href="https://www.vitraagvigyaan.org/home/knowus"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        https://www.vitraagvigyaan.org/home/knowus
                      </a>
                      .
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="privacy">
                  <AccordionTrigger>Privacy Policy</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      This privacy policy has been compiled to better serve
                      those who are concerned with how their 'Personally
                      Identifiable Information' (PII) is being used online. PII,
                      as described in US privacy law and information security,
                      is information that can be used on its own or with other
                      information to identify, contact, or locate a single
                      person, or to identify an individual in context. Please
                      read our privacy policy carefully to get a clear
                      understanding of how we collect, use, protect or otherwise
                      handle your Personally Identifiable Information in
                      accordance with our website.
                    </p>

                    <br />

                    <p className="text-muted-foreground">
                      <b>SECTION 1 - WHAT DO WE DO WITH YOUR INFORMATION?</b>{' '}
                      When you purchase something from our store, as part of the
                      buying and selling process, we collect the personal
                      information you give us such as your name, address and
                      email address.When you browse our store, we also
                      automatically receive your computer’s internet protocol
                      (IP) address in order to provide us with information that
                      helps us learn about your browser and operating
                      system.Email marketing (if applicable): With your
                      permission, we may send you emails about our store, new
                      products and other updates. What personal information do
                      we collect from the people that visit our blog, website or
                      app? When ordering or registering on our site, as
                      appropriate, you may be asked to enter your name, email
                      address, mailing address, phone number or other details to
                      help you with your experience.
                    </p>

                    <br />

                    <p className="text-muted-foreground">
                      <b>SECTION 2 - CONSENT How do you get my consent?</b> When
                      you provide us with personal information to complete a
                      transaction, verify your credit card, place an order,
                      arrange for a delivery or return a purchase, we imply that
                      you consent to our collecting it and using it for that
                      specific reason only.If we ask for your personal
                      information for a secondary reason, like marketing, we
                      will either ask you directly for your expressed consent,
                      or provide you with an opportunity to say no.How do I
                      withdraw my consent?If after you opt-in, you change your
                      mind, you may withdraw your consent for us to contact you,
                      for the continued collection, use or disclosure of your
                      information, at any time, by contacting us at
                      ss@vitraagvigyaan.org or mailing us at: Raj Nagar, Parli,
                      Post Gothavade, Taluka Sudhagadh, Off Khopoli-Pali Road
                      (same road as Adlabs Imagica), Dist. Raigad- 410205
                    </p>

                    <br />

                    <p className="text-muted-foreground">
                      <b>SECTION 3 - DISCLOSURE</b> We may disclose your
                      personal information if we are required by law to do so or
                      if you violate our Terms of Service.
                    </p>

                    <br />

                    <p className="text-muted-foreground">
                      <b>SECTION 4 - PAYMENT</b> We use Razorpay for processing
                      payments. We/Razorpay do not store your card data on their
                      servers. The data is encrypted through the Payment Card
                      Industry Data Security Standard (PCI-DSS) when processing
                      payment. Your purchase transaction data is only used as
                      long as is necessary to complete your purchase
                      transaction. After that is complete, your purchase
                      transaction information is not saved.Our payment gateway
                      adheres to the standards set by PCI-DSS as managed by the
                      PCI Security Standards Council, which is a joint effort of
                      brands like Visa, MasterCard, American Express and
                      Discover.PCI-DSS requirements help ensure the secure
                      handling of credit card information by our store and its
                      service providers.For more insight, you may also want to
                      read terms and conditions of razorpay on
                      https://razorpay.com/
                    </p>

                    <br />

                    <p className="text-muted-foreground">
                      <b>SECTION 5 - THIRD-PARTY SERVICES</b> In general, the
                      third-party providers used by us will only collect, use
                      and disclose your information to the extent necessary to
                      allow them to perform the services they provide to
                      us.However, certain third-party service providers, such as
                      payment gateways and other payment transaction processors,
                      have their own privacy policies in respect to the
                      information we are required to provide to them for your
                      purchase-related transactions.For these providers, we
                      recommend that you read their privacy policies so you can
                      understand the manner in which your personal information
                      will be handled by these providers.In particular, remember
                      that certain providers may be located in or have
                      facilities that are located a different jurisdiction than
                      either you or us. So if you elect to proceed with a
                      transaction that involves the services of a third-party
                      service provider, then your information may become subject
                      to the laws of the jurisdiction(s) in which that service
                      provider or its facilities are located.Once you leave our
                      store’s website or are redirected to a third-party website
                      or application, you are no longer governed by this Privacy
                      Policy or our website’s Terms of Service.LinksWhen you
                      click on links on our store, they may direct you away from
                      our site. We are not responsible for the privacy practices
                      of other sites and encourage you to read their privacy
                      statements.
                    </p>

                    <br />

                    <p className="text-muted-foreground">
                      <b>SECTION 6 - SECURITY</b> To protect your personal
                      information, we take reasonable precautions and follow
                      industry best practices to make sure it is not
                      inappropriately lost, misused, accessed, disclosed,
                      altered or destroyed.
                    </p>

                    <br />

                    <p className="text-muted-foreground">
                      <b>SECTION 7 - COOKIES</b> We use cookies to maintain
                      session of your user. It is not used to personally
                      identify you on other websites
                    </p>

                    <br />

                    <p className="text-muted-foreground">
                      <b>SECTION 8 - AGE OF CONSENT</b> By using this site, you
                      represent that you are at least the age of majority in
                      your state or province of residence, or that you are the
                      age of majority in your state or province of residence and
                      you have given us your consent to allow any of your minor
                      dependents to use this site.
                    </p>

                    <br />

                    <p className="text-muted-foreground">
                      <b>SECTION 9 - CHANGES TO THIS PRIVACY POLICY</b> We
                      reserve the right to modify this privacy policy at any
                      time, so please review it frequently. Changes and
                      clarifications will take effect immediately upon their
                      posting on the website. If we make material changes to
                      this policy, we will notify you here that it has been
                      updated, so that you are aware of what information we
                      collect, how we use it, and under what circumstances, if
                      any, we use and/or disclose it.If our store is acquired or
                      merged with another company, your information may be
                      transferred to the new owners so that we may continue to
                      sell products to you.QUESTIONS AND CONTACT INFORMATIONIf
                      you would like to: access, correct, amend or delete any
                      personal information we have about you, register a
                      complaint, or simply want more information contact our Sat
                      Shrut Team at ss@vitraagvigyaan.org or by mail at Raj
                      Nagar, Parli, Post Gothavade, Taluka Sudhagadh, Off
                      Khopoli-Pali Road (same road as Adlabs Imagica), Dist.
                      Raigad- 410205Refund and Cancellation policyOnce the
                      purchase has been made, there is no cancellation, return
                      or refund policy applicable in context of this purchase.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="refund">
                  <AccordionTrigger>Refund Policy</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      Thank you for visiting{' '}
                      <b>anandmahotsav.vitraagvigyaan.org.</b> Please note that{' '}
                      <b>
                        all payments made on this website are non-refundable.
                      </b>{' '}
                      Once a payment has been successfully processed, no refunds
                      will be issued under any circumstances. We encourage you
                      to carefully review all details before completing your
                      transaction. For any urgent matters or concerns, please
                      feel free to contact us at{' '}
                      <a
                        href="mailto:ss@vitraagvigyaan.org"
                        target="_blank"
                        className="text-blue-500 underline"
                      >
                        ss@vitraagvigyaan.org
                      </a>
                      , and we will do our best to assist you. Thank you for
                      your understanding and support.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="contact">
                  <AccordionTrigger>Contact Us</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-muted-foreground">
                      <p>
                        <b>Name:</b> Darshan Soni
                      </p>
                      <p>
                        <b>Address:</b> Raj Nagar, Parli, Post Gothavade,Taluka
                        Sudhagadh, Off Khopoli-Pali RoadDist. Raigad- 410205,
                        Maharashtra.
                      </p>
                      <p>
                        <b>Email:</b>{' '}
                        <a
                          href="mailto:ss@vitraagvigyaan.org"
                          target="_blank"
                          className="text-blue-500 underline"
                        >
                          ss@vitraagvigyaan.org
                        </a>
                      </p>
                      <p>
                        <b>Phone:</b>{' '}
                        <a
                          href="tel:+91-9876543210"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          +91-9876543210
                        </a>
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

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
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={isLoading}
                      >
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
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={isLoading}
                      >
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
