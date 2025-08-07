import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useSelector } from "react-redux";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { Toast } from "../ui/toast";
import { useToast } from "@/hooks/use-toast";

const StripeCheckoutButton = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const checkoutState = useSelector((state) => state.checkout);
  const { userAddress } = checkoutState;

  const authState = useSelector((state) => state.auth);
  const { isAuthenticated, user } = authState;

  const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  if (!STRIPE_PUBLIC_KEY) {
    return null;
  }

  const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const stripe = await stripePromise;
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/checkout/stripe`,
        { isAuthenticated, user }
      );

      console.log("Response Data: ", response);

      if (response?.data?.success) {
        const result = await stripe?.redirectToCheckout({
          sessionId: response.data.sessionId,
        });

        console.log("Result: ", result);
      } else {
        toast({
          variant: "destructive",
          title: response?.data?.message,
        });
      }
    } catch (error) {
      console.error("Error checking out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleCheckout} className="cursor-pointer w-full">
      {isLoading ? <Loader2 className="animate-spin" /> : "Buy Now"}
    </Button>
  );
};

export default StripeCheckoutButton;
