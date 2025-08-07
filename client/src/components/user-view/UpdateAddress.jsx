import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchUserAddress,
  updateUserAddress,
} from "@/store/slices/checkout-slice";
import { Loader2 } from "lucide-react";

const UpdateAddress = ({ isUpdateAddressOpen, setIsUpdateAddressOpen }) => {
  const { toast } = useToast();

  const [isUpdateAddressLoading, setIsUpdateAddressLoading] = useState(false);

  const authState = useSelector((state) => state.auth);
  const { user } = authState;

  const checkoutState = useSelector((state) => state.checkout);
  const { userAddress } = checkoutState;

  const dispatch = useDispatch();

  const defaultValues = {
    name: userAddress.name,
    streetAddress: userAddress.streetAddress,
    city: userAddress.city,
    region: userAddress.region,
    postalCode: userAddress.postalCode,
    country: userAddress.country,
  };

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({ defaultValues });

  const handleSubmitUpdatedAddress = async (updatedAddressFromData) => {
    setIsUpdateAddressLoading(true);
    const addressFormData = {
      ...updatedAddressFromData,
      userId: user.userId,
    };

    const response = await dispatch(updateUserAddress(addressFormData));

    setIsUpdateAddressLoading(false);

    if (response?.payload?.success) {
      dispatch(fetchUserAddress(user.userId));
      toast({
        title: response?.payload?.message,
        style: {
          color: "white",
          backgroundColor: "green",
          border: "none",
        },
      });
    } else {
      toast({
        variant: "destructive",
        title: response?.payload?.message,
      });
    }

    setIsUpdateAddressOpen(false);
  };

  return (
    <form
      id="updateAddressFrom"
      className="mx-auto w-[80%]"
      onSubmit={handleSubmit(handleSubmitUpdatedAddress)}
    >
      <h1 className="text-center text-xl md:text-2xl font-medium py-4">
        Update Address Information
      </h1>
      <Label className="text-left w-full mt-6 mb-2 text-black block dark:text-white">
        Full Name
      </Label>
      <Input
        {...register("name")}
        placeholder="John Doe"
        className="dark:bg-zinc-900 dark:text-white dark:placeholder-white dark:border-zinc-900"
      />

      <Label className="text-left w-full mt-6 mb-2 text-black block dark:text-white">
        Street Address
      </Label>
      <Input
        {...register("streetAddress")}
        placeholder="123 Main St"
        className="dark:bg-zinc-900 dark:text-white dark:placeholder-white dark:border-zinc-900"
      />

      <Label className="text-left w-full mt-6 mb-2 text-black block dark:text-white">
        City
      </Label>
      <Input
        {...register("city")}
        placeholder="New York"
        className="dark:bg-zinc-900 dark:text-white dark:placeholder-white dark:border-zinc-900"
      />

      <Label className="text-left w-full mt-6 mb-2 text-black block dark:text-white">
        State/Province/Region
      </Label>
      <Input
        {...register("region")}
        placeholder="NY"
        className="dark:bg-zinc-900 dark:text-white dark:placeholder-white dark:border-zinc-900"
      />

      <Label className="text-left w-full mt-6 mb-2 text-black block dark:text-white">
        Postal/Zip Code
      </Label>
      <Input
        {...register("postalCode")}
        placeholder="10001"
        className="dark:bg-zinc-900 dark:text-white dark:placeholder-white dark:border-zinc-900"
      />

      <Label className="text-left w-full mt-6 mb-2 text-black block dark:text-white">
        Country
      </Label>
      <Input
        {...register("country")}
        placeholder="USA"
        className="dark:bg-zinc-900 dark:text-white dark:placeholder-white dark:border-zinc-900"
      />
      <Button className="w-full mt-4" type="submit">
        {isUpdateAddressLoading ? (
          <div className="animate-spin z-50 overflow-hidden flex justify-center items-center">
            <Loader2 />
          </div>
        ) : (
          <span>Update</span>
        )}
      </Button>
    </form>
  );
};

export default UpdateAddress;
